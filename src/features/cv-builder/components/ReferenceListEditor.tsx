import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
  addLabel,
}: ReferenceListEditorProps) {
  const cvUi = useCvUi();
  const { t } = useTranslation();
  const resolvedAddLabel = addLabel ?? t('cvBuilder.sections.references.addLabel');
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
          title={entry.name.trim() || t('cvBuilder.editors.references.entryFallback', { index: index + 1 })}
          onRemove={() => onChange(entries.filter((e) => e.id !== entry.id))}
        >
          <FormField label={t('cvBuilder.editors.references.nameLabel')}>
            <Input
              value={entry.name}
              onChangeText={(v) => updateEntry(entry.id, { name: v })}
              placeholder={t('cvBuilder.editors.references.namePlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.references.positionLabel')}>
            <Input
              value={entry.position}
              onChangeText={(v) => updateEntry(entry.id, { position: v })}
              placeholder={t('cvBuilder.editors.references.positionPlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.references.companyLabel')}>
            <Input
              value={entry.company}
              onChangeText={(v) => updateEntry(entry.id, { company: v })}
              placeholder={t('cvBuilder.editors.references.companyPlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.references.emailLabel')}>
            <Input
              value={entry.email}
              onChangeText={(v) => updateEntry(entry.id, { email: v })}
              placeholder={t('cvBuilder.editors.references.emailPlaceholder')}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.references.phoneLabel')}>
            <Input
              value={entry.phone}
              onChangeText={(v) => updateEntry(entry.id, { phone: v })}
              placeholder={t('cvBuilder.editors.references.phonePlaceholder')}
              keyboardType="phone-pad"
            />
          </FormField>
        </CVEntryCard>
      ))}
      <CVAddButton label={resolvedAddLabel} onPress={() => onChange([...entries, createEmptyReference()])} />
    </View>
  );
}
