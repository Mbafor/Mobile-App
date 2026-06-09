#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILES = [
    "src/features/cv-builder/components/TagListEditor.tsx",
    "src/features/cv-builder/components/CVSectionContent.tsx",
    "src/features/cv-builder/components/shared/CVEntryCard.tsx",
    "src/features/cv-builder/components/AchievementListEditor.tsx",
    "src/features/cv-builder/components/CertificationListEditor.tsx",
    "src/features/cv-builder/components/ProjectListEditor.tsx",
    "src/features/cv-builder/components/ExperienceListEditor.tsx",
    "src/features/cv-builder/components/EducationListEditor.tsx",
    "src/features/cv-builder/components/LanguageListEditor.tsx",
    "src/features/cv-builder/components/ReferenceListEditor.tsx",
]

for rel in FILES:
    path = ROOT / rel
    text = path.read_text(encoding="utf-8")
    text = text.replace(
        "import { cvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';",
        "import { useCvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';",
    )
    for m in list(re.finditer(r"export function (\w+)\([^)]*\) \{", text)):
        pos = m.end()
        snippet = text[pos : pos + 120]
        if "useCvUi()" in snippet:
            continue
        text = text[:pos] + "\n  const cvUi = useCvUi();" + text[pos:]
        break
    path.write_text(text, encoding="utf-8")
    print(f"Updated: {rel}")
