/**
 * Migrates files using static `colors` in StyleSheet.create to useThemedStyles.
 * Run: node scripts/migrate-themed-styles.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const SKIP_FILES = new Set([
  'src/constants/theme/colors.ts',
  'src/constants/theme/palettes.ts',
  'src/constants/theme/types.ts',
  'src/components/ui/Text.tsx',
  'src/components/ui/Button.tsx',
  'src/components/ui/Input.tsx',
  'src/components/ui/TextArea.tsx',
  'src/components/layout/Screen.tsx',
  'src/components/layout/PageHeader.tsx',
  'src/features/settings/screens/SettingsHomeScreen.tsx',
  'src/features/settings/components/AppearanceSection.tsx',
  'src/features/help/components/SupportContactHint.tsx',
  'src/features/cv-builder/constants/cv-docs-theme.ts',
  'src/features/mentorship/constants/theme.ts',
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      walk(full, files);
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
}

function migrate(content, filePath) {
  if (!content.includes('colors.')) return null;
  if (!content.includes('StyleSheet.create')) return null;
  if (!content.match(/from ['"]@\/constants\/theme['"]/)) return null;
  if (content.includes('useThemedStyles')) return null;

  let result = content;

  // Update theme import: remove colors, keep others
  result = result.replace(
    /import\s*\{([^}]+)\}\s*from\s*['"]@\/constants\/theme['"];/,
    (match, imports) => {
      const parts = imports
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s && s !== 'colors');
      if (parts.length === 0) return '';
      return `import { ${parts.join(', ')} } from '@/constants/theme';`;
    },
  );

  // Add new imports if not present
  if (!result.includes("from '@/hooks/useThemedStyles'")) {
    const importAnchor = result.match(/^import .+$/m);
    if (importAnchor) {
      const pos = result.indexOf(importAnchor[0]);
      const lastImportIdx = result.lastIndexOf('\nimport ', pos + 5000);
      const insertAt = result.indexOf('\n', lastImportIdx >= 0 ? lastImportIdx : pos) + 1;
      result =
        result.slice(0, insertAt) +
        "import type { ColorScheme } from '@/constants/theme/types';\n" +
        "import { useThemedStyles } from '@/hooks/useThemedStyles';\n" +
        result.slice(insertAt);
    }
  }

  // Convert const styles = StyleSheet.create to function createStyles
  result = result.replace(
    /const\s+styles\s*=\s*StyleSheet\.create\(\{/,
    'function createStyles(colors: ColorScheme) {\n  return StyleSheet.create({',
  );

  // Close createStyles function - find the closing }); of styles
  const createIdx = result.indexOf('function createStyles');
  if (createIdx === -1) return null;

  // Find matching close for StyleSheet.create
  const start = result.indexOf('StyleSheet.create({', createIdx);
  let depth = 0;
  let end = -1;
  for (let i = start; i < result.length; i++) {
    if (result[i] === '{') depth++;
    if (result[i] === '}') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return null;

  // After `});` add closing brace for function
  const afterClose = result.slice(end);
  const closeMatch = afterClose.match(/^\}\);/);
  if (!closeMatch) return null;
  const insertPos = end + closeMatch[0].length;
  result = result.slice(0, insertPos) + '\n}' + result.slice(insertPos);

  // Add useThemedStyles to exported function components
  const fnPattern = /export\s+function\s+(\w+)\s*\([^)]*\)\s*\{/g;
  let fnMatch;
  const fns = [];
  while ((fnMatch = fnPattern.exec(result)) !== null) {
    fns.push({ name: fnMatch[1], index: fnMatch.index + fnMatch[0].length });
  }

  // Also default export functions
  const defaultFnPattern = /export\s+default\s+function\s+(\w+)?\s*\([^)]*\)\s*\{/g;
  while ((fnMatch = defaultFnPattern.exec(result)) !== null) {
    fns.push({ name: fnMatch[1] || 'default', index: fnMatch.index + fnMatch[0].length });
  }

  if (fns.length === 0) return null;

  // Insert useThemedStyles in each function (reverse order to preserve indices)
  fns.sort((a, b) => b.index - a.index);
  for (const fn of fns) {
    const bodyStart = fn.index;
    const snippet = result.slice(bodyStart, bodyStart + 200);
    if (snippet.includes('useThemedStyles(createStyles)')) continue;
    result =
      result.slice(0, bodyStart) +
      '\n  const styles = useThemedStyles(createStyles);' +
      result.slice(bodyStart);
  }

  return result;
}

const dirs = [path.join(ROOT, 'src'), path.join(ROOT, 'app')];
let migrated = 0;
let skipped = 0;

for (const dir of dirs) {
  for (const file of walk(dir)) {
    const r = rel(file);
    if (SKIP_FILES.has(r)) {
      skipped++;
      continue;
    }
    const content = fs.readFileSync(file, 'utf8');
    const next = migrate(content, file);
    if (next && next !== content) {
      fs.writeFileSync(file, next);
      migrated++;
      console.log('Migrated:', r);
    }
  }
}

console.log(`\nDone. Migrated ${migrated} files, skipped ${skipped} reserved files.`);
