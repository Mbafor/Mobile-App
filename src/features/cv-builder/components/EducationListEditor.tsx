import { View } from 'react-native';

import { FormField } from '@/components/forms';
import { Input } from '@/components/ui';
import { CVAddButton } from '@/features/cv-builder/components/shared/CVAddButton';
import { CVEntryCard } from '@/features/cv-builder/components/shared/CVEntryCard';
import { CVSectionHeader } from '@/features/cv-builder/components/shared/CVSectionHeader';
import { cvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';
import { createEmptyEducation } from '@/features/cv-builder/utils/normalize-cv-content';
import type { CVEducationEntry } from '@/types/domain/cv';

type EducationListEditorProps = {
  title: string;
  description?: string;
  addLabel?: string;
  entries: CVEducationEntry[];
  onChange: (entries: CVEducationEntry[]) => void;
};

export function EducationListEditor({
  title,
  description,
  addLabel = 'Add education',
  entries,
  onChange,
}: EducationListEditorProps) {
  const updateEntry = (id: string, patch: Partial<CVEducationEntry>) => {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const removeEntry = (id: string) => {
    onChange(entries.filter((e) => e.id !== id));
  };

  return (
    <View style={cvUi.sectionGap}>
      <CVSectionHeader title={title} description={description} />

      {entries.map((entry, index) => (
        <CVEntryCard
          key={entry.id}
          index={index}
          title={entry.school.trim() || `Education ${index + 1}`}
          onRemove={() => removeEntry(entry.id)}
        >
          <FormField label="School *">
            <Input
              value={entry.school}
              onChangeText={(v) => updateEntry(entry.id, { school: v })}
              placeholder="University or school"
            />
          </FormField>
          <FormField label="Degree *">
            <Input
              value={entry.degree}
              onChangeText={(v) => updateEntry(entry.id, { degree: v })}
              placeholder="e.g. BSc"
            />
          </FormField>
          <FormField label="Field of study">
            <Input
              value={entry.fieldOfStudy}
              onChangeText={(v) => updateEntry(entry.id, { fieldOfStudy: v })}
              placeholder="e.g. Computer Science"
            />
          </FormField>
          <FormField label="Start date">
            <Input
              value={entry.startDate}
              onChangeText={(v) => updateEntry(entry.id, { startDate: v })}
              placeholder="e.g. 2019"
            />
          </FormField>
          <FormField label="End date">
            <Input
              value={entry.endDate}
              onChangeText={(v) => updateEntry(entry.id, { endDate: v })}
              placeholder="e.g. 2023"
            />
          </FormField>
          <FormField label="GPA">
            <Input
              value={entry.gpa}
              onChangeText={(v) => updateEntry(entry.id, { gpa: v })}
              placeholder="e.g. 3.8 / 4.0"
            />
          </FormField>
        </CVEntryCard>
      ))}

      <CVAddButton label={addLabel} onPress={() => onChange([...entries, createEmptyEducation()])} />
    </View>
  );
}
