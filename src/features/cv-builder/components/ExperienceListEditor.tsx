import { Switch, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';

import { FormField } from '@/components/forms';
import { Input, Text, TextArea } from '@/components/ui';
import { CVAddButton } from '@/features/cv-builder/components/shared/CVAddButton';
import { CVEntryCard } from '@/features/cv-builder/components/shared/CVEntryCard';
import { CVSectionHeader } from '@/features/cv-builder/components/shared/CVSectionHeader';
import { useCvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';

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
  addLabel,
}: ExperienceListEditorProps) {
  const { colors } = useTheme();
  const cvUi = useCvUi();
  const { t } = useTranslation();
  const resolvedAddLabel = addLabel ?? t('cvBuilder.editors.addEntryDefault');
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
              : t('cvBuilder.editors.experience.entryFallback', { index: index + 1 })
          }
          onRemove={() => removeEntry(entry.id)}
        >
          <FormField label={t('cvBuilder.editors.experience.companyLabel')}>
            <Input
              value={entry.company}
              onChangeText={(v) => updateEntry(entry.id, { company: v })}
              placeholder={t('cvBuilder.editors.experience.companyPlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.experience.roleLabel')}>
            <Input
              value={entry.role}
              onChangeText={(v) => updateEntry(entry.id, { role: v })}
              placeholder={t('cvBuilder.editors.experience.rolePlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.experience.locationLabel')}>
            <Input
              value={entry.location}
              onChangeText={(v) => updateEntry(entry.id, { location: v })}
              placeholder={t('cvBuilder.editors.experience.locationPlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.experience.startDateLabel')}>
            <Input
              value={entry.startDate}
              onChangeText={(v) => updateEntry(entry.id, { startDate: v })}
              placeholder={t('cvBuilder.editors.experience.startDatePlaceholder')}
            />
          </FormField>
          <View style={cvUi.switchRow}>
            <Text>{t('cvBuilder.editors.experience.currentlyWorking')}</Text>
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
            <FormField label={t('cvBuilder.editors.experience.endDateLabel')}>
              <Input
                value={entry.endDate}
                onChangeText={(v) => updateEntry(entry.id, { endDate: v })}
                placeholder={t('cvBuilder.editors.experience.endDatePlaceholder')}
              />
            </FormField>
          ) : null}
          <FormField label={t('cvBuilder.editors.experience.descriptionLabel')}>
            <TextArea
              value={entry.description}
              onChangeText={(v) => updateEntry(entry.id, { description: v })}
              placeholder={t('cvBuilder.editors.experience.descriptionPlaceholder')}
              minHeight={120}
            />
          </FormField>
        </CVEntryCard>
      ))}

      <CVAddButton label={resolvedAddLabel} onPress={addEntry} />
    </View>
  );
}
