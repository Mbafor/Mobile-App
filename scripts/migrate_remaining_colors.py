#!/usr/bin/env python3
"""Migrate remaining files that import colors - inline usage or StyleSheet."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

REMAINING = [
    "src/features/cv-builder/components/ExperienceListEditor.tsx",
    "src/features/cv-builder/screens/CVTipsScreen.tsx",
    "src/features/opportunities/components/tracker/TrackerColumn.tsx",
    "src/features/opportunities/components/tracker/TrackerCard.tsx",
    "src/features/opportunities/components/SavedOpportunityListRow.tsx",
    "src/features/opportunities/components/OpportunityListRow.tsx",
    "src/features/opportunities/components/FilterDropdownGroup.tsx",
    "src/features/opportunities/components/OpportunityCard.tsx",
    "src/features/opportunities/components/FilterChipGroup.tsx",
    "src/features/onboarding/components/OnboardingProgress.tsx",
    "src/features/auth/screens/SplashScreen.tsx",
    "src/features/admin/screens/AdminEditOpportunityScreen.tsx",
    "src/features/admin/components/AdminDataTable.tsx",
    "app/index.web.tsx",
    "app/(main)/(tabs)/super-admin/opportunities/_layout.tsx",
    "app/(main)/(tabs)/super-admin/opportunities/[id]/edit.tsx",
]


def strip_colors_import(content: str) -> str:
    def repl(m):
        parts = [p.strip() for p in m.group(1).split(",") if p.strip() and p.strip() != "colors"]
        if not parts:
            return ""
        return f"import {{ {', '.join(parts)} }} from '@/constants/theme';"

    return re.sub(
        r"import\s*\{([^}]+)\}\s*from\s*['\"]@/constants/theme['\"];",
        repl,
        content,
        count=1,
    )


def add_theme_imports(content: str, use_styles: bool) -> str:
    imports = []
    if use_styles and "useThemedStyles" not in content:
        imports.append("import type { ColorScheme } from '@/constants/theme/types';")
        imports.append("import { useThemedStyles } from '@/hooks/useThemedStyles';")
    if "useTheme" not in content and "colors." in content:
        imports.append("import { useTheme } from '@/hooks/useTheme';")
    if not imports:
        return content
    first = re.search(r"^import .+$", content, re.M)
    if not first:
        return content
    insert = first.end() + 1
    block = "\n".join(imports) + "\n"
    return content[:insert] + block + content[insert:]


def migrate_stylesheet(content: str) -> str:
    if "const styles = StyleSheet.create" not in content:
        return content
    content = re.sub(
        r"const\s+styles\s*=\s*StyleSheet\.create\(\{",
        "function createStyles(colors: ColorScheme) {\n  return StyleSheet.create({",
        content,
        count=1,
    )
    idx = content.find("function createStyles")
    if idx == -1:
        return content
    start = content.find("StyleSheet.create({", idx)
    depth = 0
    end = -1
    for i in range(start, len(content)):
        if content[i] == "{":
            depth += 1
        elif content[i] == "}":
            depth -= 1
            if depth == 0:
                end = i
                break
    if end != -1 and content[end : end + 3] == "});":
        content = content[: end + 3] + "\n}" + content[end + 3 :]
    for m in list(re.finditer(r"export\s+(?:default\s+)?function\s+\w*\s*\([^)]*\)\s*\{", content)):
        pos = m.end()
        if "useThemedStyles(createStyles)" not in content[pos : pos + 200]:
            content = (
                content[:pos]
                + "\n  const styles = useThemedStyles(createStyles);"
                + content[pos:]
            )
    return content


def add_use_theme(content: str) -> str:
    for m in list(re.finditer(r"export\s+(?:default\s+)?function\s+\w*\s*\([^)]*\)\s*\{", content)):
        pos = m.end()
        snippet = content[pos : pos + 300]
        if "useTheme()" in snippet:
            continue
        if "colors." in content[pos:]:
            content = content[:pos] + "\n  const { colors } = useTheme();" + content[pos:]
    return content


for rel in REMAINING:
    path = ROOT / rel
    if not path.exists():
        print(f"Skip missing: {rel}")
        continue
    text = path.read_text(encoding="utf-8")
    if "colors" not in text:
        continue
    has_sheet = "const styles = StyleSheet.create" in text and "colors." in text
    result = strip_colors_import(text)
    result = add_theme_imports(result, has_sheet)
    if has_sheet:
        result = migrate_stylesheet(result)
    result = add_use_theme(result)
    if result != text:
        path.write_text(result, encoding="utf-8")
        print(f"Migrated: {rel}")

print("Done.")
