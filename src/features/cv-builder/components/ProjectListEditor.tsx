import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
  addLabel,
}: ProjectListEditorProps) {
  const cvUi = useCvUi();
  const { t } = useTranslation();
  const resolvedAddLabel = addLabel ?? t('cvBuilder.sections.projects.addLabel');
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
          title={entry.name.trim() || t('cvBuilder.editors.projects.entryFallback', { index: index + 1 })}
          onRemove={() => onChange(entries.filter((e) => e.id !== entry.id))}
        >
          <FormField label={t('cvBuilder.editors.projects.nameLabel')}>
            <Input
              value={entry.name}
              onChangeText={(v) => updateEntry(entry.id, { name: v })}
              placeholder={t('cvBuilder.editors.projects.namePlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.projects.descriptionLabel')}>
            <TextArea
              value={entry.description}
              onChangeText={(v) => updateEntry(entry.id, { description: v })}
              placeholder={t('cvBuilder.editors.projects.descriptionPlaceholder')}
              minHeight={120}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.projects.technologiesLabel')}>
            <Input
              value={entry.technologies}
              onChangeText={(v) => updateEntry(entry.id, { technologies: v })}
              placeholder={t('cvBuilder.editors.projects.technologiesPlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.projects.linkLabel')}>
            <Input
              value={entry.link}
              onChangeText={(v) => updateEntry(entry.id, { link: v })}
              placeholder={t('cvBuilder.editors.projects.linkPlaceholder')}
              autoCapitalize="none"
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.projects.startDateLabel')}>
            <Input
              value={entry.startDate}
              onChangeText={(v) => updateEntry(entry.id, { startDate: v })}
              placeholder={t('cvBuilder.editors.projects.startDatePlaceholder')}
            />
          </FormField>
          <FormField label={t('cvBuilder.editors.projects.endDateLabel')}>
            <Input
              value={entry.endDate}
              onChangeText={(v) => updateEntry(entry.id, { endDate: v })}
              placeholder={t('cvBuilder.editors.projects.endDatePlaceholder')}
            />
          </FormField>
        </CVEntryCard>
      ))}
      <CVAddButton label={resolvedAddLabel} onPress={() => onChange([...entries, createEmptyProject()])} />
    </View>
  );
}
