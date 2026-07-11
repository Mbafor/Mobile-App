import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FormField } from '@/components/forms';
import { Input } from '@/components/ui';
import { CVAddButton } from '@/features/cv-builder/components/shared/CVAddButton';
import { CVEntryCard } from '@/features/cv-builder/components/shared/CVEntryCard';
import { CVSectionHeader } from '@/features/cv-builder/components/shared/CVSectionHeader';
import { useCvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';
import { createEmptyLanguage } from '@/features/cv-builder/utils/normalize-cv-content';
import type { CVLanguageEntry } from '@/types/domain/cv';

type LanguageListEditorProps = {
  title: string;
  description?: string;
  addLabel?: string;
  entries: CVLanguageEntry[];
  onChange: (entries: CVLanguageEntry[]) => void;
};

export function LanguageListEditor({
  title,
  description,
  addLabel,
  entries,
  onChange,
}: LanguageListEditorProps) {
  const cvUi = useCvUi();
  const { t } = useTranslation();
  const resolvedAddLabel = addLabel ?? t('cvBuilder.sections.languages.addLabel');
  const updateEntry = (id: string, patch: Partial<CVLanguageEntry>) => {
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
          title={entry.language.trim() || t('cvBuilder.editors.languages.entryFallback', { index: index + 1 })}
          onRemove={() => removeEntry(entry.id)}
        >
          <FormField label={t('cvBuilder.editors.languages.languageLabel')}>
            <Input
              value={entry.language}
              onChangeText={(v) => updateEntry(entry.id, { language: v })}
              placeholder={t('cvBuilder.editors.languages.languagePlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.languages.proficiencyLabel')}>
            <Input
              value={entry.proficiency}
              onChangeText={(v) => updateEntry(entry.id, { proficiency: v })}
              placeholder={t('cvBuilder.editors.languages.proficiencyPlaceholder')}
            />
          </FormField>
        </CVEntryCard>
      ))}

      <CVAddButton label={resolvedAddLabel} onPress={() => onChange([...entries, createEmptyLanguage()])} />
    </View>
  );
}
