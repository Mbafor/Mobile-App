import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FormField } from '@/components/forms';
import { Input, TextArea } from '@/components/ui';
import { CVAddButton } from '@/features/cv-builder/components/shared/CVAddButton';
import { CVEntryCard } from '@/features/cv-builder/components/shared/CVEntryCard';
import { CVSectionHeader } from '@/features/cv-builder/components/shared/CVSectionHeader';
import { useCvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';
import { createEmptyEducation } from '@/features/cv-builder/utils/normalize-cv-content';
import type { CVEducationEntry } from '@/types/domain/cv';

type EducationListEditorProps = {
  title: string;
  description?: string;
  addLabel?: string;
  entries: CVEducationEntry[];
  onChange: (entries: CVEducationEntry[]) => void;
};

export function EducationListEditor({
  title,
  description,
  addLabel,
  entries,
  onChange,
}: EducationListEditorProps) {
  const cvUi = useCvUi();
  const { t } = useTranslation();
  const resolvedAddLabel = addLabel ?? t('cvBuilder.sections.education.addLabel');
  const updateEntry = (id: string, patch: Partial<CVEducationEntry>) => {
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
          title={entry.school.trim() || t('cvBuilder.editors.education.entryFallback', { index: index + 1 })}
          onRemove={() => removeEntry(entry.id)}
        >
          <FormField label={t('cvBuilder.editors.education.schoolLabel')}>
            <Input
              value={entry.school}
              onChangeText={(v) => updateEntry(entry.id, { school: v })}
              placeholder={t('cvBuilder.editors.education.schoolPlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.education.degreeLabel')}>
            <Input
              value={entry.degree}
              onChangeText={(v) => updateEntry(entry.id, { degree: v })}
              placeholder={t('cvBuilder.editors.education.degreePlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.education.fieldOfStudyLabel')}>
            <Input
              value={entry.fieldOfStudy}
              onChangeText={(v) => updateEntry(entry.id, { fieldOfStudy: v })}
              placeholder={t('cvBuilder.editors.education.fieldOfStudyPlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.education.startDateLabel')}>
            <Input
              value={entry.startDate}
              onChangeText={(v) => updateEntry(entry.id, { startDate: v })}
              placeholder={t('cvBuilder.editors.education.startDatePlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.education.endDateLabel')}>
            <Input
              value={entry.endDate}
              onChangeText={(v) => updateEntry(entry.id, { endDate: v })}
              placeholder={t('cvBuilder.editors.education.endDatePlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.education.gpaLabel')}>
            <Input
              value={entry.gpa}
              onChangeText={(v) => updateEntry(entry.id, { gpa: v })}
              placeholder={t('cvBuilder.editors.education.gpaPlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.education.descriptionLabel')}>
            <TextArea
              value={entry.description}
              onChangeText={(v) => updateEntry(entry.id, { description: v })}
              placeholder={t('cvBuilder.editors.education.descriptionPlaceholder')}
              minHeight={100}
            />
          </FormField>
        </CVEntryCard>
      ))}

      <CVAddButton label={resolvedAddLabel} onPress={() => onChange([...entries, createEmptyEducation()])} />
    </View>
  );
}
