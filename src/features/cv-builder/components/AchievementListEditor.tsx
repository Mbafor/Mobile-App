import { View } from 'react-native';

import { FormField } from '@/components/forms';
import { Input, TextArea } from '@/components/ui';
import { CVAddButton } from '@/features/cv-builder/components/shared/CVAddButton';
import { CVEntryCard } from '@/features/cv-builder/components/shared/CVEntryCard';
import { CVSectionHeader } from '@/features/cv-builder/components/shared/CVSectionHeader';
import { useCvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';
import { createEmptyAchievement } from '@/features/cv-builder/utils/normalize-cv-content';
import type { CVAchievementEntry } from '@/types/domain/cv';

type AchievementListEditorProps = {
  title: string;
  description?: string;
  entries: CVAchievementEntry[];
  onChange: (entries: CVAchievementEntry[]) => void;
  addLabel?: string;
};

export function AchievementListEditor({
  title,
  description,
  entries,
  onChange,
  addLabel = 'Add achievement',
}: AchievementListEditorProps) {
  const cvUi = useCvUi();
  const updateEntry = (id: string, patch: Partial<CVAchievementEntry>) => {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  return (
    <View style={cvUi.sectionGap}>
      <CVSectionHeader title={title} description={description} />
      {entries.map((entry, index) => (
        <CVEntryCard
          key={entry.id}
          index={index}
          title={entry.title.trim() || `Achievement ${index + 1}`}
          onRemove={() => onChange(entries.filter((e) => e.id !== entry.id))}
        >
          <FormField label="Title *">
            <Input
              value={entry.title}
              onChangeText={(v) => updateEntry(entry.id, { title: v })}
              placeholder="Award or honour"
            />
          </FormField>
          <FormField label="Date">
            <Input
              value={entry.date}
              onChangeText={(v) => updateEntry(entry.id, { date: v })}
              placeholder="e.g. 2025"
            />
          </FormField>
          <FormField label="Description">
            <TextArea
              value={entry.description}
              onChangeText={(v) => updateEntry(entry.id, { description: v })}
              placeholder="What you achieved and why it matters"
              minHeight={100}
            />
          </FormField>
        </CVEntryCard>
      ))}
      <CVAddButton
        label={addLabel}
        onPress={() => onChange([...entries, createEmptyAchievement()])}
      />
    </View>
  );
}
