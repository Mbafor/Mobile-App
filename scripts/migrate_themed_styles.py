#!/usr/bin/env python3
"""Migrate static colors in StyleSheet.create to useThemedStyles."""
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

SKIP = {
    "src/constants/theme/colors.ts",
    "src/constants/theme/palettes.ts",
    "src/constants/theme/types.ts",
    "src/components/ui/Text.tsx",
    "src/components/ui/Button.tsx",
    "src/components/ui/Input.tsx",
    "src/components/ui/TextArea.tsx",
    "src/components/layout/Screen.tsx",
    "src/components/layout/PageHeader.tsx",
    "src/features/settings/screens/SettingsHomeScreen.tsx",
    "src/features/settings/components/AppearanceSection.tsx",
    "src/features/cv-builder/constants/cv-docs-theme.ts",
    "src/features/mentorship/constants/theme.ts",
}


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def walk_tsx(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in ("node_modules", ".git")]
        for name in filenames:
            if name.endswith((".tsx", ".ts")):
                yield Path(dirpath) / name


def migrate(content: str) -> str | None:
    if "colors." not in content:
        return None
    if "StyleSheet.create" not in content:
        return None
    if not re.search(r"from ['\"]@/constants/theme['\"]", content):
        return None
    if "useThemedStyles" in content:
        return None

    result = content

    def strip_colors(m):
        parts = [p.strip() for p in m.group(1).split(",") if p.strip() and p.strip() != "colors"]
        if not parts:
            return ""
        return f"import {{ {', '.join(parts)} }} from '@/constants/theme';"

    result = re.sub(
        r"import\s*\{([^}]+)\}\s*from\s*['\"]@/constants/theme['\"];",
        strip_colors,
        result,
        count=1,
    )

    if "from '@/hooks/useThemedStyles'" not in result:
        first_import = re.search(r"^import .+$", result, re.M)
        if first_import:
            insert = first_import.end() + 1
            result = (
                result[:insert]
                + "import type { ColorScheme } from '@/constants/theme/types';\n"
                + "import { useThemedStyles } from '@/hooks/useThemedStyles';\n"
                + result[insert:]
            )

    result = re.sub(
        r"const\s+styles\s*=\s*StyleSheet\.create\(\{",
        "function createStyles(colors: ColorScheme) {\n  return StyleSheet.create({",
        result,
        count=1,
    )

    if "function createStyles" not in result:
        return None

    idx = result.find("function createStyles")
    start = result.find("StyleSheet.create({", idx)
    depth = 0
    end = -1
    for i in range(start, len(result)):
        ch = result[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i
                break
    if end == -1:
        return None

    after = result[end : end + 3]
    if not after.startswith("});"):
        return None
    result = result[: end + 3] + "\n}" + result[end + 3 :]

    fns = []
    for m in re.finditer(r"export\s+function\s+\w+\s*\([^)]*\)\s*\{", result):
        fns.append(m.end())
    for m in re.finditer(r"export\s+default\s+function\s+\w*\s*\([^)]*\)\s*\{", result):
        fns.append(m.end())

    if not fns:
        return None

    for pos in sorted(fns, reverse=True):
        snippet = result[pos : pos + 200]
        if "useThemedStyles(createStyles)" in snippet:
            continue
        result = (
            result[:pos]
            + "\n  const styles = useThemedStyles(createStyles);"
            + result[pos:]
        )

    return result


def main():
    migrated = 0
    for base in (ROOT / "src", ROOT / "app"):
        if not base.exists():
            continue
        for path in walk_tsx(base):
            r = rel(path)
            if r in SKIP:
                continue
            text = path.read_text(encoding="utf-8")
            next_text = migrate(text)
            if next_text and next_text != text:
                path.write_text(next_text, encoding="utf-8")
                migrated += 1
                print(f"Migrated: {r}")
    print(f"\nDone. Migrated {migrated} files.")


if __name__ == "__main__":
    main()
