import { View } from 'react-native';

import { FormField } from '@/components/forms';
import { Input } from '@/components/ui';
import { CVAddButton } from '@/features/cv-builder/components/shared/CVAddButton';
import { CVEntryCard } from '@/features/cv-builder/components/shared/CVEntryCard';
import { CVSectionHeader } from '@/features/cv-builder/components/shared/CVSectionHeader';
import { useCvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';
import { createEmptyReference } from '@/features/cv-builder/utils/normalize-cv-content';
import type { CVReferenceEntry } from '@/types/domain/cv';

type ReferenceListEditorProps = {
  title: string;
  description?: string;
  entries: CVReferenceEntry[];
  onChange: (entries: CVReferenceEntry[]) => void;
  addLabel?: string;
};

export function ReferenceListEditor({
  title,
  description,
  entries,
  onChange,
  addLabel = 'Add reference',
}: ReferenceListEditorProps) {
  const cvUi = useCvUi();
  const updateEntry = (id: string, patch: Partial<CVReferenceEntry>) => {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  return (
    <View style={cvUi.sectionGap}>
      <CVSectionHeader title={title} description={description} />
      {entries.map((entry, index) => (
        <CVEntryCard
          key={entry.id}
          index={index}
          title={entry.name.trim() || `Reference ${index + 1}`}
          onRemove={() => onChange(entries.filter((e) => e.id !== entry.id))}
        >
          <FormField label="Name *">
            <Input
              value={entry.name}
              onChangeText={(v) => updateEntry(entry.id, { name: v })}
              placeholder="Full name"
            />
          </FormField>
          <FormField label="Position">
            <Input
              value={entry.position}
              onChangeText={(v) => updateEntry(entry.id, { position: v })}
              placeholder="Job title"
            />
          </FormField>
          <FormField label="Company *">
            <Input
              value={entry.company}
              onChangeText={(v) => updateEntry(entry.id, { company: v })}
              placeholder="Organisation"
            />
          </FormField>
          <FormField label="Email">
            <Input
              value={entry.email}
              onChangeText={(v) => updateEntry(entry.id, { email: v })}
              placeholder="email@company.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </FormField>
          <FormField label="Phone">
            <Input
              value={entry.phone}
              onChangeText={(v) => updateEntry(entry.id, { phone: v })}
              placeholder="+44 …"
              keyboardType="phone-pad"
            />
          </FormField>
        </CVEntryCard>
      ))}
      <CVAddButton label={addLabel} onPress={() => onChange([...entries, createEmptyReference()])} />
    </View>
  );
}
