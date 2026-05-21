import { View } from 'react-native';

import { FormField } from '@/components/forms';
import { Input } from '@/components/ui';
import { CVAddButton } from '@/features/cv-builder/components/shared/CVAddButton';
import { CVEntryCard } from '@/features/cv-builder/components/shared/CVEntryCard';
import { CVSectionHeader } from '@/features/cv-builder/components/shared/CVSectionHeader';
import { cvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';
import { createEmptyCertification } from '@/features/cv-builder/utils/normalize-cv-content';
import type { CVCertificationEntry } from '@/types/domain/cv';

type CertificationListEditorProps = {
  title: string;
  description?: string;
  addLabel?: string;
  entries: CVCertificationEntry[];
  onChange: (entries: CVCertificationEntry[]) => void;
};

export function CertificationListEditor({
  title,
  description,
  addLabel = 'Add certification',
  entries,
  onChange,
}: CertificationListEditorProps) {
  const updateEntry = (id: string, patch: Partial<CVCertificationEntry>) => {
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
          title={entry.name.trim() || `Certification ${index + 1}`}
          onRemove={() => removeEntry(entry.id)}
        >
          <FormField label="Name *">
            <Input
              value={entry.name}
              onChangeText={(v) => updateEntry(entry.id, { name: v })}
              placeholder="Certification name"
            />
          </FormField>
          <FormField label="Issuer">
            <Input
              value={entry.issuer}
              onChangeText={(v) => updateEntry(entry.id, { issuer: v })}
              placeholder="Issuing organisation"
            />
          </FormField>
          <FormField label="Year">
            <Input
              value={entry.year}
              onChangeText={(v) => updateEntry(entry.id, { year: v })}
              placeholder="e.g. 2024"
              keyboardType="number-pad"
            />
          </FormField>
        </CVEntryCard>
      ))}

      <CVAddButton
        label={addLabel}
        onPress={() => onChange([...entries, createEmptyCertification()])}
      />
    </View>
  );
}
