import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import {
  ContactCentered,
  getContactItems,
  renderAchievements,
  renderCertBullets,
  renderEducationAts,
  renderExperienceStandard,
  renderLanguagesLine,
  renderProjectsStandard,
  renderReferencesFull,
  Section,
  SkillsTechnicalSoft,
} from '@/features/cv-builder/templates/shared/primitives';
import { hasText } from '@/features/cv-builder/components/preview/preview-shared';
import type { CVContent } from '@/types/domain/cv';

/** ATS Elite — single column, centered header; section order matches website sample. */
export function ATSTemplate({ content }: { content: CVContent }) {
  const name = content.personalInfo.fullName.trim() || 'Your Name';
  const contacts = getContactItems(content);
  const t = styles;

  return (
    <View style={t.page}>
      <View style={t.header}>
        <Text style={t.name}>{name.toUpperCase()}</Text>
        <ContactCentered items={contacts} textStyle={t.contact} sepStyle={t.contact} />
      </View>

      {hasText(content.summary) ? (
        <Section title="PROFESSIONAL SUMMARY" titleStyle={t.sectionTitle}>
          <Text style={t.summary}>{content.summary}</Text>
        </Section>
      ) : null}

      {content.education.length > 0 ? (
        <Section title="EDUCATION" titleStyle={t.sectionTitle}>
          {renderEducationAts(content.education, {
            title: t.mainTitle,
            sub: t.subTitle,
            date: t.date,
            body: t.body,
          })}
        </Section>
      ) : null}

      {content.skills.length > 0 ? (
        <Section title="SKILLS" titleStyle={t.sectionTitle}>
          <SkillsTechnicalSoft skills={content.skills} labelStyle={t.skillLabel} textStyle={t.body} />
        </Section>
      ) : null}

      {content.projects.length > 0 ? (
        <Section title="KEY PROJECTS" titleStyle={t.sectionTitle}>
          {renderProjectsStandard(content.projects, {
            title: t.mainTitle,
            date: t.date,
            body: t.body,
            tech: t.tech,
          })}
        </Section>
      ) : null}

      {content.experience.length > 0 ? (
        <Section title="PROFESSIONAL EXPERIENCE" titleStyle={t.sectionTitle}>
          {renderExperienceStandard(content.experience, {
            title: t.mainTitle,
            sub: t.subTitle,
            date: t.date,
            body: t.body,
          })}
        </Section>
      ) : null}

      {content.certifications.some((c) => c.name.trim()) ? (
        <Section title="CERTIFICATIONS" titleStyle={t.sectionTitle}>
          {renderCertBullets(content.certifications, t.body)}
        </Section>
      ) : null}

      {content.languages.length > 0 ? (
        <Section title="LANGUAGES" titleStyle={t.sectionTitle}>
          {renderLanguagesLine(content.languages, t.body)}
        </Section>
      ) : null}

      {content.achievements.length > 0 ? (
        <Section title="ACHIEVEMENTS & AWARDS" titleStyle={t.sectionTitle}>
          {renderAchievements(content.achievements, {
            title: t.mainTitle,
            date: t.date,
            body: t.body,
          })}
        </Section>
      ) : null}

      {content.voluntaryExperience.length > 0 ? (
        <Section title="VOLUNTEER EXPERIENCE" titleStyle={t.sectionTitle}>
          {renderExperienceStandard(content.voluntaryExperience, {
            title: t.mainTitle,
            sub: t.subTitle,
            date: t.date,
            body: t.body,
          })}
        </Section>
      ) : null}

      {content.references.length > 0 ? (
        <Section title="REFERENCES" titleStyle={t.sectionTitle}>
          {renderReferencesFull(content.references, {
            name: t.refName,
            sub: t.refSub,
            meta: t.body,
          })}
        </Section>
      ) : null}

      {content.hobbies.length > 0 ? (
        <Section title="INTERESTS" titleStyle={t.sectionTitle}>
          <Text style={t.body}>{content.hobbies.join(', ')}</Text>
        </Section>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingVertical: 24, paddingHorizontal: 28, backgroundColor: '#FFFFFF' },
  header: { marginBottom: 12, alignItems: 'center' },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  contact: { fontSize: 9.5, color: '#1F2937' },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1F2937',
    paddingBottom: 2,
  },
  summary: { fontSize: 10.5, lineHeight: 14, color: '#1F2937', textAlign: 'justify' },
  mainTitle: { fontSize: 11, fontWeight: '700', color: '#1F2937' },
  subTitle: { fontSize: 11, fontStyle: 'italic', color: '#1F2937' },
  date: { fontSize: 10, fontWeight: '700', color: '#1F2937', minWidth: 72, textAlign: 'right' },
  body: { fontSize: 10.5, lineHeight: 14, color: '#1F2937' },
  skillLabel: { width: 72, fontSize: 10.5, fontWeight: '700', color: '#1F2937' },
  tech: { fontSize: 9.5, fontStyle: 'italic', color: '#1F2937', marginTop: 2 },
  refName: { fontSize: 10.5, fontWeight: '700', color: '#1F2937' },
  refSub: { fontSize: 10.5, fontStyle: 'italic', color: '#1F2937' },
});
