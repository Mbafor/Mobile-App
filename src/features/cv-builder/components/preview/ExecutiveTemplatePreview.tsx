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

export function ExecutiveTemplatePreview({ content }: { content: CVContent }) {
  const contact = buildContactLine(content);
  const name = content.personalInfo.fullName.trim() || 'Your Name';

  return (
    <View style={styles.page}>
      <View style={styles.banner}>
        <Text style={styles.name}>{name}</Text>
        {hasText(contact) ? <Text style={styles.contact}>{contact}</Text> : null}
      </View>

      <View style={styles.body}>
        {hasText(content.summary) ? (
          <PreviewSection title="Executive Summary" titleStyle={styles.title}>
            <Text style={styles.p}>{content.summary}</Text>
          </PreviewSection>
        ) : null}

        {content.experience.length > 0 ? (
          <PreviewSection title="Professional Experience" titleStyle={styles.title}>
            {content.experience.map((e) => (
              <PreviewEntry
                key={e.id}
                heading={e.role}
                subheading={e.company}
                meta={formatExperienceDates(e.startDate, e.endDate, e.currentlyWorking)}
                body={e.description}
                headingStyle={{ fontSize: 12, color: '#111' }}
              />
            ))}
          </PreviewSection>
        ) : null}

        {content.education.length > 0 ? (
          <PreviewSection title="Education" titleStyle={styles.title}>
            {content.education.map((e) => (
              <PreviewEntry
                key={e.id}
                heading={e.school}
                subheading={`${e.degree}${hasText(e.gpa) ? ` · GPA ${e.gpa}` : ''}`}
                meta={[e.startDate, e.endDate].filter(hasText).join(' – ')}
              />
            ))}
          </PreviewSection>
        ) : null}

        {content.skills.length > 0 ? (
          <PreviewSection title="Core Competencies" titleStyle={styles.title}>
            <Text style={styles.p}>{content.skills.join(' • ')}</Text>
          </PreviewSection>
        ) : null}

        {content.certifications.length > 0 ? (
          <PreviewSection title="Certifications" titleStyle={styles.title}>
            {content.certifications.map((c) => (
              <PreviewEntry key={c.id} heading={`${c.name} (${c.year})`} subheading={c.issuer} />
            ))}
          </PreviewSection>
        ) : null}

        {content.voluntaryExperience.length > 0 ? (
          <PreviewSection title="Board & Volunteer" titleStyle={styles.title}>
            {content.voluntaryExperience.map((e) => (
              <PreviewEntry key={e.id} heading={e.role} subheading={e.company} body={e.description} />
            ))}
          </PreviewSection>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: '#FFF' },
  banner: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  name: { fontSize: 24, fontWeight: '700', color: '#FFF', letterSpacing: 0.5 },
  contact: { fontSize: 10, color: '#CCC', marginTop: 6 },
  body: { padding: 18 },
  title: { color: '#1A1A1A', fontSize: 11, letterSpacing: 1 },
  p: { fontSize: 10, lineHeight: 15, color: '#333' },
});
