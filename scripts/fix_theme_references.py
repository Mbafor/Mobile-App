#!/usr/bin/env python3
"""Fix incomplete theme migration — safe insertion only."""
from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def get_tsc_error_files() -> set[str]:
    result = subprocess.run(
        ["npx", "tsc", "--noEmit"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        shell=True,
    )
    files: set[str] = set()
    for line in result.stdout.splitlines() + result.stderr.splitlines():
        m = re.match(r"^([^(]+)\(\d+", line)
        if m and "error TS2304" in line:
            files.add(m.group(1).replace("\\", "/"))
    return files


def outside_create_styles(content: str) -> str:
    parts = re.split(r"function\s+createStyles\s*\([^)]*\)\s*\{", content, maxsplit=1)
    out = parts[0]
    if len(parts) > 1:
        rest = parts[1]
        depth = 1
        i = 0
        while i < len(rest) and depth:
            if rest[i] == "{":
                depth += 1
            elif rest[i] == "}":
                depth -= 1
            i += 1
        out += rest[i:]
    return out


def ensure_use_theme_import(content: str) -> str:
    if "from '@/hooks/useTheme'" in content:
        return content
    m = re.search(r"^import .+$", content, re.M)
    insert = m.end() + 1 if m else 0
    return content[:insert] + "import { useTheme } from '@/hooks/useTheme';\n" + content[insert:]


def ensure_colors_import(content: str) -> str:
    if "from '@/constants/theme/colors'" in content:
        return content
    m = re.search(r"^import .+$", content, re.M)
    insert = m.end() + 1 if m else 0
    return content[:insert] + "import { colors } from '@/constants/theme/colors';\n" + content[insert:]


def ensure_alert_import(content: str) -> str:
    if not re.search(r"\bAlert\.", content):
        return content
    m = re.search(r"import\s*\{([^}]+)\}\s*from\s*['\"]react-native['\"];", content)
    if m and "Alert" in m.group(1):
        return content
    if m:
        names = [n.strip() for n in m.group(1).split(",")]
        if "Alert" not in names:
            names.append("Alert")
        new_imp = f"import {{ {', '.join(names)} }} from 'react-native';"
        return content[: m.start()] + new_imp + content[m.end() :]
    return content


def theme_parts_needed(body: str) -> list[str]:
    parts = []
    if re.search(r"\bcolors\.", body):
        parts.append("colors")
    if re.search(r"\bmentorshipColors\.", body):
        parts.append("mentorshipColors")
    if re.search(r"\bcvDocsTheme\.", body):
        parts.append("cvDocsTheme")
    return parts


def insert_after_styles_hook(body: str, lines_to_add: list[str]) -> str | None:
    """Insert new const lines immediately after styles hook if present, else at top."""
    if not lines_to_add:
        return None
    lines = body.split("\n")
    insert_at = 0
    for i, line in enumerate(lines):
        s = line.strip()
        if not s or s.startswith("//"):
            continue
        if "useThemedStyles(createStyles)" in s or "useAppThemedStyles(createStyles)" in s:
            insert_at = i + 1
            break
        # first real statement — insert before it
        insert_at = i
        break
    for line in reversed(lines_to_add):
        lines.insert(insert_at, line)
    return "\n".join(lines)


def fix_file(path: Path) -> bool:
    content = path.read_text(encoding="utf-8")
    original = content
    outside = outside_create_styles(content)

    # Module-level StyleSheet using colors
    if (
        re.search(r"^(const|let)\s+\w+\s*=\s*StyleSheet\.create", content, re.M)
        and re.search(r"\bcolors\.", content)
        and "useThemedStyles" not in content
        and "useAppThemedStyles" not in content
    ):
        content = ensure_colors_import(content)

    uses_app = "useAppThemedStyles" in content
    hook = "useAppThemedStyles" if uses_app else "useThemedStyles"

    if re.search(r"\bcolors\.|\bmentorshipColors\.|\bcvDocsTheme\.", outside):
        content = ensure_use_theme_import(content)

    content = ensure_alert_import(content)

    # Fix each function except createStyles
    pattern = re.compile(
        r"^(export\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{",
        re.MULTILINE,
    )
    offset = 0
    for m in list(pattern.finditer(content)):
        if m.group(2) == "createStyles":
            continue
        start = m.end() - 1 + offset
        depth = 0
        end = start
        for i in range(start, len(content)):
            if content[i] == "{":
                depth += 1
            elif content[i] == "}":
                depth -= 1
                if depth == 0:
                    end = i
                    break
        body = content[start + 1 : end]
        if "useTheme()" in body:
            # maybe missing parts only
            existing = re.search(r"const\s*\{([^}]+)\}\s*=\s*useTheme\(\)", body)
            have = set()
            if existing:
                have = {p.strip() for p in existing.group(1).split(",")}
            need = set(theme_parts_needed(body)) - have
            if not need:
                # check styles
                if re.search(r"\bstyles\.", body) and f"{hook}(createStyles)" not in body:
                    new_body = insert_after_styles_hook(body, [f"  const styles = {hook}(createStyles);"])
                    if new_body:
                        content = content[: start + 1] + new_body + content[end:]
                        offset += len(new_body) - len(body)
                continue
            if existing:
                merged = sorted(have | need)
                new_destructure = f"const {{ {', '.join(merged)} }} = useTheme();"
                new_body = body.replace(existing.group(0), new_destructure)
                content = content[: start + 1] + new_body + content[end:]
                offset += len(new_body) - len(body)
            continue

        to_add = []
        if re.search(r"\bstyles\.", body) and f"{hook}(createStyles)" not in body and "createStyles" in content:
            to_add.append(f"  const styles = {hook}(createStyles);")
        parts = theme_parts_needed(body)
        if parts:
            to_add.append(f"  const {{ {', '.join(parts)} }} = useTheme();")
        if not to_add:
            continue
        new_body = insert_after_styles_hook(body, to_add)
        if not new_body:
            continue
        content = content[: start + 1] + new_body + content[end:]
        offset += len(new_body) - len(body)

    if content != original:
        path.write_text(content, encoding="utf-8")
        return True
    return False


def main():
    error_files = get_tsc_error_files()
    print(f"TSC reports {len(error_files)} files with TS2304")
    changed = []
    for rel in sorted(error_files):
        path = ROOT / rel
        if path.exists() and fix_file(path):
            changed.append(rel)
    print(f"Fixed {len(changed)} files")
    for c in changed:
        print(f"  {c}")


if __name__ == "__main__":
    main()
