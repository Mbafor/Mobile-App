import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FormField } from '@/components/forms';
import { Input, Text, TextArea } from '@/components/ui';
import { CertificationListEditor } from '@/features/cv-builder/components/CertificationListEditor';
import { EducationListEditor } from '@/features/cv-builder/components/EducationListEditor';
import { ExperienceListEditor } from '@/features/cv-builder/components/ExperienceListEditor';
import { AchievementListEditor } from '@/features/cv-builder/components/AchievementListEditor';
import { LanguageListEditor } from '@/features/cv-builder/components/LanguageListEditor';
import { ProjectListEditor } from '@/features/cv-builder/components/ProjectListEditor';
import { ReferenceListEditor } from '@/features/cv-builder/components/ReferenceListEditor';
import { TagListEditor } from '@/features/cv-builder/components/TagListEditor';
import { CVSectionHeader } from '@/features/cv-builder/components/shared/CVSectionHeader';
import { useCvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';
import { getSectionMeta } from '@/features/cv-builder/constants/section-meta';
import type { CVSectionId } from '@/features/cv-builder/constants/sections';
import { spacing } from '@/constants/theme';
import type { CVContent } from '@/types/domain/cv';

type CVSectionContentProps = {
  section: CVSectionId;
  content: CVContent;
  onChange: (updater: (prev: CVContent) => CVContent) => void;
};

export function CVSectionContent({ section, content, onChange }: CVSectionContentProps) {
  const { colors } = useTheme();
  const cvUi = useCvUi();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const meta = getSectionMeta(section);

  switch (section) {
    case 'personal':
      return (
        <View style={cvUi.sectionGap}>
          <CVSectionHeader title={meta.title} description={meta.description} />
          <View style={styles.profileNote}>
            <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
            <Text muted style={styles.profileNoteText}>
              {t('cvBuilder.editors.personal.profileNote')}
            </Text>
          </View>
          <View style={cvUi.surfaceCard}>
            <FormField label={t('cvBuilder.editors.personal.fullNameLabel')}>
              <Input
                value={content.personalInfo.fullName}
                onChangeText={(v) =>
                  onChange((p) => ({
                    ...p,
                    personalInfo: { ...p.personalInfo, fullName: v },
                  }))
                }
                placeholder={t('cvBuilder.editors.personal.fullNamePlaceholder')}
              />
            </FormField>
            <FormField label={t('cvBuilder.editors.personal.emailLabel')}>
              <Input
                value={content.personalInfo.email}
                onChangeText={(v) =>
                  onChange((p) => ({
                    ...p,
                    personalInfo: { ...p.personalInfo, email: v },
                  }))
                }
                placeholder={t('cvBuilder.editors.personal.emailPlaceholder')}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </FormField>
            <FormField label={t('cvBuilder.editors.personal.phoneLabel')}>
              <Input
                value={content.personalInfo.phone}
                onChangeText={(v) =>
                  onChange((p) => ({
                    ...p,
                    personalInfo: { ...p.personalInfo, phone: v },
                  }))
                }
                placeholder={t('cvBuilder.editors.personal.phonePlaceholder')}
                keyboardType="phone-pad"
              />
            </FormField>
            <FormField label={t('cvBuilder.editors.personal.locationLabel')}>
              <Input
                value={content.personalInfo.location}
                onChangeText={(v) =>
                  onChange((p) => ({
                    ...p,
                    personalInfo: { ...p.personalInfo, location: v },
                  }))
                }
                placeholder={t('cvBuilder.editors.personal.locationPlaceholder')}
              />
            </FormField>
            <FormField label={t('cvBuilder.editors.personal.linkedInLabel')}>
              <Input
                value={content.personalInfo.linkedIn}
                onChangeText={(v) =>
                  onChange((p) => ({
                    ...p,
                    personalInfo: { ...p.personalInfo, linkedIn: v },
                  }))
                }
                placeholder={t('cvBuilder.editors.personal.linkedInPlaceholder')}
                autoCapitalize="none"
              />
            </FormField>
            <FormField label={t('cvBuilder.editors.personal.websiteLabel')}>
              <Input
                value={content.personalInfo.website}
                onChangeText={(v) =>
                  onChange((p) => ({
                    ...p,
                    personalInfo: { ...p.personalInfo, website: v },
                  }))
                }
                placeholder={t('cvBuilder.editors.personal.websitePlaceholder')}
                autoCapitalize="none"
              />
            </FormField>
          </View>
        </View>
      );

    case 'summary':
      return (
        <View style={cvUi.sectionGap}>
          <CVSectionHeader title={meta.title} description={meta.description} />
          <View style={cvUi.surfaceCard}>
            <FormField label={t('cvBuilder.editors.summary.label')}>
              <TextArea
                value={content.summary}
                onChangeText={(v) => onChange((p) => ({ ...p, summary: v }))}
                placeholder={t('cvBuilder.editors.summary.placeholder')}
                minHeight={160}
              />
            </FormField>
          </View>
        </View>
      );

    case 'experience':
      return (
        <ExperienceListEditor
          title={meta.title}
          description={meta.description}
          entries={content.experience}
          onChange={(experience) => onChange((p) => ({ ...p, experience }))}
          addLabel={meta.addLabel}
        />
      );

    case 'projects':
      return (
        <ProjectListEditor
          title={meta.title}
          description={meta.description}
          entries={content.projects}
          onChange={(projects) => onChange((p) => ({ ...p, projects }))}
          addLabel={meta.addLabel}
        />
      );

    case 'education':
      return (
        <EducationListEditor
          title={meta.title}
          description={meta.description}
          entries={content.education}
          onChange={(education) => onChange((p) => ({ ...p, education }))}
          addLabel={meta.addLabel}
        />
      );

    case 'skills':
      return (
        <TagListEditor
          title={meta.title}
          description={meta.description}
          tags={content.skills}
          onChange={(skills) => onChange((p) => ({ ...p, skills }))}
          placeholder="e.g. Python, Leadership"
          addLabel={meta.addLabel}
        />
      );

    case 'certifications':
      return (
        <CertificationListEditor
          title={meta.title}
          description={meta.description}
          entries={content.certifications}
          onChange={(certifications) => onChange((p) => ({ ...p, certifications }))}
          addLabel={meta.addLabel}
        />
      );

    case 'achievements':
      return (
        <AchievementListEditor
          title={meta.title}
          description={meta.description}
          entries={content.achievements}
          onChange={(achievements) => onChange((p) => ({ ...p, achievements }))}
          addLabel={meta.addLabel}
        />
      );

    case 'hobbies':
      return (
        <TagListEditor
          title={meta.title}
          description={meta.description}
          tags={content.hobbies}
          onChange={(hobbies) => onChange((p) => ({ ...p, hobbies }))}
          placeholder="e.g. Photography, Football"
          addLabel={meta.addLabel}
        />
      );

    case 'languages':
      return (
        <LanguageListEditor
          title={meta.title}
          description={meta.description}
          entries={content.languages}
          onChange={(languages) => onChange((p) => ({ ...p, languages }))}
          addLabel={meta.addLabel}
        />
      );

    case 'voluntary':
      return (
        <ExperienceListEditor
          title={meta.title}
          description={meta.description}
          entries={content.voluntaryExperience}
          onChange={(voluntaryExperience) => onChange((p) => ({ ...p, voluntaryExperience }))}
          addLabel={meta.addLabel}
        />
      );

    case 'references':
      return (
        <ReferenceListEditor
          title={meta.title}
          description={meta.description}
          entries={content.references}
          onChange={(references) => onChange((p) => ({ ...p, references }))}
          addLabel={meta.addLabel}
        />
      );

    default:
      return null;
  }
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  profileNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 10,
    backgroundColor: '#F0F4F8',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  profileNoteText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
}
