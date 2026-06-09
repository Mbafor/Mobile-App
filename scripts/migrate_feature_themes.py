#!/usr/bin/env python3
"""Migrate mentorshipColors/cvDocsTheme static imports to useAppThemedStyles."""
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

SKIP = {
    "src/features/mentorship/constants/theme.ts",
    "src/features/cv-builder/constants/cv-docs-theme.ts",
    "src/features/mentorship/components/calendar/calendar-theme.ts",
    "src/features/cv-builder/components/shared/cv-ui-styles.ts",
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
    has_mentorship = "mentorshipColors" in content and re.search(
        r"from ['\"]@/features/mentorship/constants/theme['\"]", content
    )
    has_cv = "cvDocsTheme" in content and re.search(
        r"from ['\"]@/features/cv-builder/constants/cv-docs-theme['\"]", content
    )
    if not has_mentorship and not has_cv:
        return None
    if "useAppThemedStyles" in content:
        return None
    if "StyleSheet.create" not in content:
        return None

    result = content
    result = re.sub(
        r"import\s*\{[^}]*mentorshipColors[^}]*\}\s*from\s*['\"]@/features/mentorship/constants/theme['\"];\n?",
        "",
        result,
    )
    result = re.sub(
        r"import\s*\{[^}]*cvDocsTheme[^}]*\}\s*from\s*['\"]@/features/cv-builder/constants/cv-docs-theme['\"];\n?",
        "",
        result,
    )

    if "from '@/hooks/useAppThemedStyles'" not in result:
        first_import = re.search(r"^import .+$", result, re.M)
        if first_import:
            insert = first_import.end() + 1
            result = (
                result[:insert]
                + "import type { AppTheme } from '@/constants/theme/types';\n"
                + "import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';\n"
                + result[insert:]
            )

    # Rename createStyles(colors) -> createStyles(theme) and replace color refs
    if "function createStyles(colors: ColorScheme)" in result:
        result = result.replace(
            "function createStyles(colors: ColorScheme)",
            "function createStyles(theme: AppTheme)",
        )
        result = result.replace(
            "const styles = useThemedStyles(createStyles);",
            "const styles = useAppThemedStyles(createStyles);",
        )
        # Add destructuring at start of createStyles body
        result = re.sub(
            r"function createStyles\(theme: AppTheme\) \{\n  return StyleSheet\.create\(\{",
            "function createStyles(theme: AppTheme) {\n  const { colors, mentorshipColors, cvDocsTheme } = theme;\n  return StyleSheet.create({",
            result,
            count=1,
        )
    elif "const styles = StyleSheet.create({" in result:
        result = re.sub(
            r"const\s+styles\s*=\s*StyleSheet\.create\(\{",
            "function createStyles(theme: AppTheme) {\n  const { colors, mentorshipColors, cvDocsTheme } = theme;\n  return StyleSheet.create({",
            result,
            count=1,
        )
        idx = result.find("function createStyles")
        start = result.find("StyleSheet.create({", idx)
        depth = 0
        end = -1
        for i in range(start, len(result)):
            if result[i] == "{":
                depth += 1
            elif result[i] == "}":
                depth -= 1
                if depth == 0:
                    end = i
                    break
        if end != -1 and result[end : end + 3] == "});":
            result = result[: end + 3] + "\n}" + result[end + 3 :]

        fns = []
        for m in re.finditer(r"export\s+function\s+\w+\s*\([^)]*\)\s*\{", result):
            fns.append(m.end())
        for m in re.finditer(r"export\s+default\s+function\s+\w*\s*\([^)]*\)\s*\{", result):
            fns.append(m.end())
        for pos in sorted(fns, reverse=True):
            snippet = result[pos : pos + 200]
            if "useAppThemedStyles(createStyles)" in snippet:
                continue
            result = (
                result[:pos]
                + "\n  const styles = useAppThemedStyles(createStyles);"
                + result[pos:]
            )

    return result if result != content else None


def main():
    migrated = 0
    for base in (ROOT / "src", ROOT / "app"):
        for path in walk_tsx(base):
            if rel(path) in SKIP:
                continue
            text = path.read_text(encoding="utf-8")
            next_text = migrate(text)
            if next_text:
                path.write_text(next_text, encoding="utf-8")
                migrated += 1
                print(f"Migrated: {rel(path)}")
    print(f"\nDone. Migrated {migrated} files.")


if __name__ == "__main__":
    main()
