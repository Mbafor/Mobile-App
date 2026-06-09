import { View } from 'react-native';

import { FormField } from '@/components/forms';
import { Input, TextArea } from '@/components/ui';
import { CVAddButton } from '@/features/cv-builder/components/shared/CVAddButton';
import { CVEntryCard } from '@/features/cv-builder/components/shared/CVEntryCard';
import { CVSectionHeader } from '@/features/cv-builder/components/shared/CVSectionHeader';
import { useCvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';
import { createEmptyProject } from '@/features/cv-builder/utils/normalize-cv-content';
import type { CVProjectEntry } from '@/types/domain/cv';

type ProjectListEditorProps = {
  title: string;
  description?: string;
  entries: CVProjectEntry[];
  onChange: (entries: CVProjectEntry[]) => void;
  addLabel?: string;
};

export function ProjectListEditor({
  title,
  description,
  entries,
  onChange,
  addLabel = 'Add project',
}: ProjectListEditorProps) {
  const cvUi = useCvUi();
  const updateEntry = (id: string, patch: Partial<CVProjectEntry>) => {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  return (
    <View style={cvUi.sectionGap}>
      <CVSectionHeader title={title} description={description} />
      {entries.map((entry, index) => (
        <CVEntryCard
          key={entry.id}
          index={index}
          title={entry.name.trim() || `Project ${index + 1}`}
          onRemove={() => onChange(entries.filter((e) => e.id !== entry.id))}
        >
          <FormField label="Project name *">
            <Input
              value={entry.name}
              onChangeText={(v) => updateEntry(entry.id, { name: v })}
              placeholder="e.g. Portfolio App"
            />
          </FormField>
          <FormField label="Description">
            <TextArea
              value={entry.description}
              onChangeText={(v) => updateEntry(entry.id, { description: v })}
              placeholder="What you built and the impact — one bullet per line"
              minHeight={120}
            />
          </FormField>
          <FormField label="Technologies">
            <Input
              value={entry.technologies}
              onChangeText={(v) => updateEntry(entry.id, { technologies: v })}
              placeholder="React, TypeScript, Supabase"
            />
          </FormField>
          <FormField label="Link">
            <Input
              value={entry.link}
              onChangeText={(v) => updateEntry(entry.id, { link: v })}
              placeholder="https://…"
              autoCapitalize="none"
            />
          </FormField>
          <FormField label="Start date">
            <Input
              value={entry.startDate}
              onChangeText={(v) => updateEntry(entry.id, { startDate: v })}
              placeholder="e.g. 2024"
            />
          </FormField>
          <FormField label="End date">
            <Input
              value={entry.endDate}
              onChangeText={(v) => updateEntry(entry.id, { endDate: v })}
              placeholder="Present"
            />
          </FormField>
        </CVEntryCard>
      ))}
      <CVAddButton label={addLabel} onPress={() => onChange([...entries, createEmptyProject()])} />
    </View>
  );
}
