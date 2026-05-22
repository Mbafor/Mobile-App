import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import {
  ContactRow,
  getContactItems,
  renderAchievements,
  renderCertBullets,
  renderEducationStandard,
  renderExperienceStandard,
  renderLanguagesLine,
  renderProjectsStandard,
  renderReferencesFull,
  Section,
  SkillsTechnicalSoft,
} from '@/features/cv-builder/templates/shared/primitives';
import { hasText } from '@/features/cv-builder/components/preview/preview-shared';
import type { CVContent } from '@/types/domain/cv';

/** Modern Elite — blue name, bottom border header, shaded section titles. */
export function ModernTemplate({ content }: { content: CVContent }) {
  const name = content.personalInfo.fullName.trim() || 'Your Name';
  const contacts = getContactItems(content);
  const t = styles;

  return (
    <View style={t.page}>
      <View style={t.header}>
        <Text style={t.name}>{name.toUpperCase()}</Text>
        <ContactRow items={contacts} textStyle={t.contact} sepStyle={t.sep} />
      </View>

      {hasText(content.summary) ? (
        <Section title="PROFESSIONAL PROFILE" titleStyle={t.sectionTitle}>
          <Text style={t.summary}>{content.summary}</Text>
        </Section>
      ) : null}

      {content.experience.length > 0 ? (
        <Section title="PROFESSIONAL EXPERIENCE" titleStyle={t.sectionTitle}>
          {renderExperienceStandard(content.experience, {
            title: t.primary,
            sub: t.secondary,
            date: t.date,
            body: t.body,
          })}
        </Section>
      ) : null}

      {content.projects.length > 0 ? (
        <Section title="KEY PROJECTS" titleStyle={t.sectionTitle}>
          {renderProjectsStandard(content.projects, {
            title: t.primary,
            date: t.date,
            body: t.body,
            tech: t.tech,
          })}
        </Section>
      ) : null}

      {content.skills.length > 0 ? (
        <Section title="SKILLS & EXPERTISE" titleStyle={t.sectionTitle}>
          <SkillsTechnicalSoft skills={content.skills} labelStyle={t.metaLabel} textStyle={t.body} />
        </Section>
      ) : null}

      {content.education.length > 0 ? (
        <Section title="EDUCATION" titleStyle={t.sectionTitle}>
          {renderEducationStandard(content.education, {
            title: t.primary,
            sub: t.secondary,
            date: t.date,
          })}
        </Section>
      ) : null}

      {content.achievements.length > 0 ? (
        <Section title="ACHIEVEMENTS & AWARDS" titleStyle={t.sectionTitle}>
          {renderAchievements(content.achievements, {
            title: t.primary,
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

      {content.voluntaryExperience.length > 0 ? (
        <Section title="VOLUNTEER EXPERIENCE" titleStyle={t.sectionTitle}>
          {renderExperienceStandard(content.voluntaryExperience, {
            title: t.primary,
            sub: t.secondary,
            date: t.date,
            body: t.body,
          })}
        </Section>
      ) : null}

      {content.languages.length > 0 ? (
        <Section title="LANGUAGES" titleStyle={t.sectionTitle}>
          {renderLanguagesLine(content.languages, t.body)}
        </Section>
      ) : null}

      {content.references.length > 0 ? (
        <Section title="REFERENCES" titleStyle={t.sectionTitle}>
          {renderReferencesFull(content.references, {
            name: t.primary,
            sub: t.secondary,
            meta: t.meta,
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
  page: { paddingVertical: 28, paddingHorizontal: 28, backgroundColor: '#FFFFFF' },
  header: {
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#334155',
  },
  name: { fontSize: 24, fontWeight: '700', color: '#3b82f6', marginBottom: 10, letterSpacing: 0.5 },
  contact: { fontSize: 9.5, color: '#334155', marginHorizontal: 4 },
  sep: { marginHorizontal: 6, color: '#cbd5e1', fontSize: 9.5 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    backgroundColor: '#eff6ff',
    paddingVertical: 4,
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  summary: { fontSize: 10, lineHeight: 15, color: '#334155', textAlign: 'justify' },
  primary: { fontSize: 11, fontWeight: '700', color: '#1e293b' },
  secondary: { fontSize: 11, color: '#334155', fontWeight: '500' },
  date: { fontSize: 10, fontWeight: '700', color: '#475569', textAlign: 'right' },
  body: { fontSize: 10, lineHeight: 14, color: '#334155' },
  metaLabel: { width: 72, fontSize: 10, fontWeight: '700', color: '#0f172a' },
  meta: { fontSize: 9, color: '#475569' },
  tech: { fontSize: 9, fontStyle: 'italic', color: '#475569', marginTop: 2 },
});
