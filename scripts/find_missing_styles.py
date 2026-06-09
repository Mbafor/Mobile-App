#!/usr/bin/env python3
"""Find functions using styles. without styles hook in scope."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def extract_body(content: str, brace_start: int) -> tuple[str, int]:
    depth = 0
    for i in range(brace_start, len(content)):
        if content[i] == "{":
            depth += 1
        elif content[i] == "}":
            depth -= 1
            if depth == 0:
                return content[brace_start + 1 : i], i
    return "", brace_start


def iter_functions(content: str):
    patterns = [
        re.compile(r"^(export\s+)?(default\s+)?function\s+(\w+)\s*\(", re.M),
        re.compile(r"^(export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?function\s*\(", re.M),
        re.compile(r"^(export\s+)?const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\{", re.M),
    ]
    seen = set()
    for pat in patterns:
        for m in pat.finditer(content):
            name = m.group(3) or m.group(2)
            if not name or name == "createStyles" or m.start() in seen:
                continue
            seen.add(m.start())
            brace = content.find("{", m.end())
            if brace == -1:
                continue
            body, end = extract_body(content, brace)
            yield name, body, m.start()


def has_styles_scope(body: str) -> bool:
    if "useThemedStyles(createStyles)" in body or "useAppThemedStyles(createStyles)" in body:
        return True
    if re.search(r"\{\s*styles\s*[,}]", body):
        return True
    if re.search(r"\(\s*\{[^}]*\bstyles\b", body):
        return True
    return False


def main():
    issues = []
    for path in sorted(ROOT.rglob("*.tsx")):
        if "node_modules" in path.parts:
            continue
        content = path.read_text(encoding="utf-8")
        if "styles." not in content:
            continue
        has_module_styles = bool(
            re.search(r"^const\s+styles\s*=\s*StyleSheet\.create", content, re.M)
        )
        has_create = "function createStyles" in content or "createStyles =" in content
        hook = "useAppThemedStyles" if "useAppThemedStyles" in content else "useThemedStyles"

        for name, body, _ in iter_functions(content):
            if "styles." not in body:
                continue
            if has_styles_scope(body):
                continue
            if has_module_styles and not has_create:
                continue
            issues.append(f"{path.relative_to(ROOT).as_posix()} :: {name} (needs {hook})")

    for line in issues:
        print(line)
    print(f"\nTotal: {len(issues)}")


if __name__ == "__main__":
    main()
