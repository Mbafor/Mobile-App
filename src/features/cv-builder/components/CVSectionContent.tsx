import { StyleSheet, View } from 'react-native';

import { FormField } from '@/components/forms';
import { Input } from '@/components/ui';
import { CertificationListEditor } from '@/features/cv-builder/components/CertificationListEditor';
import { EducationListEditor } from '@/features/cv-builder/components/EducationListEditor';
import { ExperienceListEditor } from '@/features/cv-builder/components/ExperienceListEditor';
import { LanguageListEditor } from '@/features/cv-builder/components/LanguageListEditor';
import { TagListEditor } from '@/features/cv-builder/components/TagListEditor';
import { CVSectionHeader } from '@/features/cv-builder/components/shared/CVSectionHeader';
import { cvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';
import { getSectionMeta } from '@/features/cv-builder/constants/section-meta';
import type { CVSectionId } from '@/features/cv-builder/constants/sections';
import type { CVContent } from '@/types/domain/cv';

type CVSectionContentProps = {
  section: CVSectionId;
  content: CVContent;
  onChange: (updater: (prev: CVContent) => CVContent) => void;
};

export function CVSectionContent({ section, content, onChange }: CVSectionContentProps) {
  const meta = getSectionMeta(section);

  switch (section) {
    case 'personal':
      return (
        <View style={cvUi.sectionGap}>
          <CVSectionHeader title={meta.title} description={meta.description} />
          <View style={cvUi.surfaceCard}>
            <FormField label="Full name">
              <Input
                value={content.personalInfo.fullName}
                onChangeText={(v) =>
                  onChange((p) => ({
                    ...p,
                    personalInfo: { ...p.personalInfo, fullName: v },
                  }))
                }
                placeholder="Your full name"
              />
            </FormField>
            <FormField label="Email">
              <Input
                value={content.personalInfo.email}
                onChangeText={(v) =>
                  onChange((p) => ({
                    ...p,
                    personalInfo: { ...p.personalInfo, email: v },
                  }))
                }
                placeholder="you@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </FormField>
            <FormField label="Phone">
              <Input
                value={content.personalInfo.phone}
                onChangeText={(v) =>
                  onChange((p) => ({
                    ...p,
                    personalInfo: { ...p.personalInfo, phone: v },
                  }))
                }
                placeholder="+44 …"
                keyboardType="phone-pad"
              />
            </FormField>
            <FormField label="Location">
              <Input
                value={content.personalInfo.location}
                onChangeText={(v) =>
                  onChange((p) => ({
                    ...p,
                    personalInfo: { ...p.personalInfo, location: v },
                  }))
                }
                placeholder="City, country"
              />
            </FormField>
            <FormField label="LinkedIn">
              <Input
                value={content.personalInfo.linkedIn}
                onChangeText={(v) =>
                  onChange((p) => ({
                    ...p,
                    personalInfo: { ...p.personalInfo, linkedIn: v },
                  }))
                }
                placeholder="linkedin.com/in/…"
                autoCapitalize="none"
              />
            </FormField>
            <FormField label="Website">
              <Input
                value={content.personalInfo.website}
                onChangeText={(v) =>
                  onChange((p) => ({
                    ...p,
                    personalInfo: { ...p.personalInfo, website: v },
                  }))
                }
                placeholder="https://…"
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
          <FormField label="Summary">
            <Input
              value={content.summary}
              onChangeText={(v) => onChange((p) => ({ ...p, summary: v }))}
              placeholder="Write 2–4 sentences about your experience and goals"
              multiline
              style={styles.multiline}
            />
          </FormField>
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

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  multiline: { minHeight: 140, textAlignVertical: 'top' },
});
