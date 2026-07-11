import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FormField } from '@/components/forms';
import { Input, TextArea } from '@/components/ui';
import { CVAddButton } from '@/features/cv-builder/components/shared/CVAddButton';
import { CVEntryCard } from '@/features/cv-builder/components/shared/CVEntryCard';
import { CVSectionHeader } from '@/features/cv-builder/components/shared/CVSectionHeader';
import { useCvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';
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
  addLabel,
  entries,
  onChange,
}: CertificationListEditorProps) {
  const cvUi = useCvUi();
  const { t } = useTranslation();
  const resolvedAddLabel = addLabel ?? t('cvBuilder.sections.certifications.addLabel');
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
          title={entry.name.trim() || t('cvBuilder.editors.certifications.entryFallback', { index: index + 1 })}
          onRemove={() => removeEntry(entry.id)}
        >
          <FormField label={t('cvBuilder.editors.certifications.nameLabel')}>
            <Input
              value={entry.name}
              onChangeText={(v) => updateEntry(entry.id, { name: v })}
              placeholder={t('cvBuilder.editors.certifications.namePlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.certifications.issuerLabel')}>
            <Input
              value={entry.issuer}
              onChangeText={(v) => updateEntry(entry.id, { issuer: v })}
              placeholder={t('cvBuilder.editors.certifications.issuerPlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.certifications.yearLabel')}>
            <Input
              value={entry.year}
              onChangeText={(v) => updateEntry(entry.id, { year: v })}
              placeholder={t('cvBuilder.editors.certifications.yearPlaceholder')}
              keyboardType="number-pad"
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.certifications.descriptionLabel')}>
            <TextArea
              value={entry.description}
              onChangeText={(v) => updateEntry(entry.id, { description: v })}
              placeholder={t('cvBuilder.editors.certifications.descriptionPlaceholder')}
              minHeight={80}
            />
          </FormField>
        </CVEntryCard>
      ))}

      <CVAddButton
        label={resolvedAddLabel}
        onPress={() => onChange([...entries, createEmptyCertification()])}
      />
    </View>
  );
}
