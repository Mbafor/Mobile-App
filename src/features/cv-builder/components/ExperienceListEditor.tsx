import { Switch, View } from 'react-native';

import { FormField } from '@/components/forms';
import { Input, Text, TextArea } from '@/components/ui';
import { CVAddButton } from '@/features/cv-builder/components/shared/CVAddButton';
import { CVEntryCard } from '@/features/cv-builder/components/shared/CVEntryCard';
import { CVSectionHeader } from '@/features/cv-builder/components/shared/CVSectionHeader';
import { cvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';
import { colors } from '@/constants/theme';
import { createEmptyExperience } from '@/features/cv-builder/utils/normalize-cv-content';
import type { CVExperienceEntry } from '@/types/domain/cv';

type ExperienceListEditorProps = {
  title: string;
  description?: string;
  entries: CVExperienceEntry[];
  onChange: (entries: CVExperienceEntry[]) => void;
  addLabel?: string;
};

export function ExperienceListEditor({
  title,
  description,
  entries,
  onChange,
  addLabel = 'Add entry',
}: ExperienceListEditorProps) {
  const updateEntry = (id: string, patch: Partial<CVExperienceEntry>) => {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const removeEntry = (id: string) => {
    onChange(entries.filter((e) => e.id !== id));
  };

  const addEntry = () => {
    onChange([...entries, createEmptyExperience()]);
  };

  return (
    <View style={cvUi.sectionGap}>
      <CVSectionHeader title={title} description={description} />

      {entries.map((entry, index) => (
        <CVEntryCard
          key={entry.id}
          index={index}
          title={
            entry.role.trim() || entry.company.trim()
              ? [entry.role, entry.company].filter(Boolean).join(' · ')
              : `Entry ${index + 1}`
          }
          onRemove={() => removeEntry(entry.id)}
        >
          <FormField label="Company / organisation *">
            <Input
              value={entry.company}
              onChangeText={(v) => updateEntry(entry.id, { company: v })}
              placeholder="Company name"
            />
          </FormField>
          <FormField label="Role *">
            <Input
              value={entry.role}
              onChangeText={(v) => updateEntry(entry.id, { role: v })}
              placeholder="Job title"
            />
          </FormField>
          <FormField label="Location">
            <Input
              value={entry.location}
              onChangeText={(v) => updateEntry(entry.id, { location: v })}
              placeholder="City, country"
            />
          </FormField>
          <FormField label="Start date">
            <Input
              value={entry.startDate}
              onChangeText={(v) => updateEntry(entry.id, { startDate: v })}
              placeholder="e.g. Jan 2022"
            />
          </FormField>
          <View style={cvUi.switchRow}>
            <Text>Currently working here</Text>
            <Switch
              value={entry.currentlyWorking}
              onValueChange={(v) =>
                updateEntry(entry.id, {
                  currentlyWorking: v,
                  endDate: v ? '' : entry.endDate,
                })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          {!entry.currentlyWorking ? (
            <FormField label="End date">
              <Input
                value={entry.endDate}
                onChangeText={(v) => updateEntry(entry.id, { endDate: v })}
                placeholder="e.g. Dec 2024"
              />
            </FormField>
          ) : null}
          <FormField label="Description">
            <TextArea
              value={entry.description}
              onChangeText={(v) => updateEntry(entry.id, { description: v })}
              placeholder="Key responsibilities and achievements — one bullet per line"
              minHeight={120}
            />
          </FormField>
        </CVEntryCard>
      ))}

      <CVAddButton label={addLabel} onPress={addEntry} />
    </View>
  );
}
