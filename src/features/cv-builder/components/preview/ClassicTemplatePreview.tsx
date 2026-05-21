import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import {
  buildContactLine,
  formatExperienceDates,
  hasText,
  PreviewEntry,
  PreviewSection,
} from '@/features/cv-builder/components/preview/preview-shared';
import type { CVContent } from '@/types/domain/cv';

export function ClassicTemplatePreview({ content }: { content: CVContent }) {
  const contact = buildContactLine(content);
  const name = content.personalInfo.fullName.trim() || 'Your Name';

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        {hasText(contact) ? <Text style={styles.contact}>{contact}</Text> : null}
      </View>
      <View style={styles.rule} />

      {hasText(content.summary) ? (
        <PreviewSection title="Summary" titleStyle={styles.sectionTitle}>
          <Text style={styles.body}>{content.summary}</Text>
        </PreviewSection>
      ) : null}

      {content.experience.length > 0 ? (
        <PreviewSection title="Experience" titleStyle={styles.sectionTitle}>
          {content.experience.map((e) => (
            <PreviewEntry
              key={e.id}
              heading={e.role}
              subheading={e.company}
              meta={`${formatExperienceDates(e.startDate, e.endDate, e.currentlyWorking)}${hasText(e.location) ? ` · ${e.location}` : ''}`}
              body={e.description}
            />
          ))}
        </PreviewSection>
      ) : null}

      {content.education.length > 0 ? (
        <PreviewSection title="Education" titleStyle={styles.sectionTitle}>
          {content.education.map((e) => (
            <PreviewEntry
              key={e.id}
              heading={`${e.degree}${hasText(e.fieldOfStudy) ? ` in ${e.fieldOfStudy}` : ''}`}
              subheading={e.school}
              meta={[e.startDate, e.endDate, e.gpa ? `GPA: ${e.gpa}` : ''].filter(hasText).join(' · ')}
            />
          ))}
        </PreviewSection>
      ) : null}

      {content.skills.length > 0 ? (
        <PreviewSection title="Skills" titleStyle={styles.sectionTitle}>
          <Text style={styles.body}>{content.skills.join(', ')}</Text>
        </PreviewSection>
      ) : null}

      {content.certifications.length > 0 ? (
        <PreviewSection title="Certifications" titleStyle={styles.sectionTitle}>
          {content.certifications.map((c) => (
            <PreviewEntry
              key={c.id}
              heading={c.name}
              subheading={c.issuer}
              meta={c.year}
            />
          ))}
        </PreviewSection>
      ) : null}

      {content.languages.length > 0 ? (
        <PreviewSection title="Languages" titleStyle={styles.sectionTitle}>
          {content.languages.map((l) => (
            <PreviewEntry
              key={l.id}
              heading={l.language}
              subheading={l.proficiency}
            />
          ))}
        </PreviewSection>
      ) : null}

      {content.hobbies.length > 0 ? (
        <PreviewSection title="Hobbies" titleStyle={styles.sectionTitle}>
          <Text style={styles.body}>{content.hobbies.join(', ')}</Text>
        </PreviewSection>
      ) : null}

      {content.voluntaryExperience.length > 0 ? (
        <PreviewSection title="Voluntary Experience" titleStyle={styles.sectionTitle}>
          {content.voluntaryExperience.map((e) => (
            <PreviewEntry
              key={e.id}
              heading={e.role}
              subheading={e.company}
              meta={formatExperienceDates(e.startDate, e.endDate, e.currentlyWorking)}
              body={e.description}
            />
          ))}
        </PreviewSection>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: '#FFFFFF' },
  header: { alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 22, fontWeight: '700', color: '#1A1A1A' },
  contact: { fontSize: 10, color: '#444', marginTop: 4, textAlign: 'center' },
  rule: { height: 2, backgroundColor: '#1A1A1A', marginBottom: 14 },
  sectionTitle: { color: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: '#CCC', paddingBottom: 2 },
  body: { fontSize: 11, lineHeight: 16, color: '#333' },
});
