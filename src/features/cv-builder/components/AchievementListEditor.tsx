import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
  addLabel,
}: AchievementListEditorProps) {
  const cvUi = useCvUi();
  const { t } = useTranslation();
  const resolvedAddLabel = addLabel ?? t('cvBuilder.sections.achievements.addLabel');
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
          title={entry.title.trim() || t('cvBuilder.editors.achievements.entryFallback', { index: index + 1 })}
          onRemove={() => onChange(entries.filter((e) => e.id !== entry.id))}
        >
          <FormField label={t('cvBuilder.editors.achievements.titleLabel')}>
            <Input
              value={entry.title}
              onChangeText={(v) => updateEntry(entry.id, { title: v })}
              placeholder={t('cvBuilder.editors.achievements.titlePlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.achievements.dateLabel')}>
            <Input
              value={entry.date}
              onChangeText={(v) => updateEntry(entry.id, { date: v })}
              placeholder={t('cvBuilder.editors.achievements.datePlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.achievements.descriptionLabel')}>
            <TextArea
              value={entry.description}
              onChangeText={(v) => updateEntry(entry.id, { description: v })}
              placeholder={t('cvBuilder.editors.achievements.descriptionPlaceholder')}
              minHeight={100}
            />
          </FormField>
        </CVEntryCard>
      ))}
      <CVAddButton
        label={resolvedAddLabel}
        onPress={() => onChange([...entries, createEmptyAchievement()])}
      />
    </View>
  );
}
