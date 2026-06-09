#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PATTERNS = [
    (
        re.compile(
            r"import \{\nimport type \{ ColorScheme \} from '@/constants/theme/types';\n"
            r"import \{ useThemedStyles \} from '@/hooks/useThemedStyles';\n",
            re.M,
        ),
        (
            "import type { ColorScheme } from '@/constants/theme/types';\n"
            "import { useThemedStyles } from '@/hooks/useThemedStyles';\n"
            "import {\n"
        ),
    ),
    (
        re.compile(
            r"import \{\nimport type \{ AppTheme \} from '@/constants/theme/types';\n"
            r"import \{ useAppThemedStyles \} from '@/hooks/useAppThemedStyles';\n",
            re.M,
        ),
        (
            "import type { AppTheme } from '@/constants/theme/types';\n"
            "import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';\n"
            "import {\n"
        ),
    ),
]

fixed_count = 0
for path in list((ROOT / "src").rglob("*.tsx")) + list((ROOT / "src").rglob("*.ts")) + list(
    (ROOT / "app").rglob("*.tsx")
):
    text = path.read_text(encoding="utf-8")
    original = text
    for pattern, replacement in PATTERNS:
        text = pattern.sub(replacement, text)
    if text != original:
        path.write_text(text, encoding="utf-8")
        fixed_count += 1
        print(f"Fixed: {path.relative_to(ROOT).as_posix()}")

print(f"\nFixed {fixed_count} files.")
