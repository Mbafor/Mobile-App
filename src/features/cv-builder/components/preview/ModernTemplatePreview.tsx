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

export function ModernTemplatePreview({ content }: { content: CVContent }) {
  const contact = buildContactLine(content);
  const name = content.personalInfo.fullName.trim() || 'Your Name';

  return (
    <View style={styles.page}>
      <View style={styles.sidebar}>
        <Text style={styles.name}>{name}</Text>
        {hasText(contact) ? <Text style={styles.contact}>{contact}</Text> : null}
        {content.skills.length > 0 ? (
          <View style={styles.sidebarBlock}>
            <Text style={styles.sidebarLabel}>Skills</Text>
            <Text style={styles.sidebarText}>{content.skills.join('\n')}</Text>
          </View>
        ) : null}
        {content.languages.length > 0 ? (
          <View style={styles.sidebarBlock}>
            <Text style={styles.sidebarLabel}>Languages</Text>
            {content.languages.map((l) => (
              <Text key={l.id} style={styles.sidebarText}>
                {l.language}
                {hasText(l.proficiency) ? ` (${l.proficiency})` : ''}
              </Text>
            ))}
          </View>
        ) : null}
        {content.hobbies.length > 0 ? (
          <View style={styles.sidebarBlock}>
            <Text style={styles.sidebarLabel}>Hobbies</Text>
            <Text style={styles.sidebarText}>{content.hobbies.join(', ')}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.main}>
        {hasText(content.summary) ? (
          <PreviewSection title="Profile" titleStyle={styles.mainTitle}>
            <Text style={styles.body}>{content.summary}</Text>
          </PreviewSection>
        ) : null}
        {content.experience.length > 0 ? (
          <PreviewSection title="Experience" titleStyle={styles.mainTitle}>
            {content.experience.map((e) => (
              <PreviewEntry
                key={e.id}
                heading={e.role}
                subheading={e.company}
                meta={formatExperienceDates(e.startDate, e.endDate, e.currentlyWorking)}
                body={e.description}
                headingStyle={{ color: '#2D5A3D' }}
              />
            ))}
          </PreviewSection>
        ) : null}
        {content.education.length > 0 ? (
          <PreviewSection title="Education" titleStyle={styles.mainTitle}>
            {content.education.map((e) => (
              <PreviewEntry
                key={e.id}
                heading={e.school}
                subheading={`${e.degree}${hasText(e.fieldOfStudy) ? ` · ${e.fieldOfStudy}` : ''}`}
                meta={[e.startDate, e.endDate].filter(hasText).join(' – ')}
              />
            ))}
          </PreviewSection>
        ) : null}
        {content.certifications.length > 0 ? (
          <PreviewSection title="Certifications" titleStyle={styles.mainTitle}>
            {content.certifications.map((c) => (
              <PreviewEntry key={c.id} heading={c.name} subheading={`${c.issuer} · ${c.year}`} />
            ))}
          </PreviewSection>
        ) : null}
        {content.voluntaryExperience.length > 0 ? (
          <PreviewSection title="Volunteering" titleStyle={styles.mainTitle}>
            {content.voluntaryExperience.map((e) => (
              <PreviewEntry
                key={e.id}
                heading={e.role}
                subheading={e.company}
                body={e.description}
              />
            ))}
          </PreviewSection>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flexDirection: 'row', minHeight: 400, backgroundColor: '#FFF' },
  sidebar: {
    width: '34%',
    backgroundColor: '#2D5A3D',
    padding: 14,
  },
  name: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  contact: { fontSize: 9, color: '#D8E8DE', marginTop: 6, lineHeight: 13 },
  sidebarBlock: { marginTop: 14 },
  sidebarLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A8C9B4',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sidebarText: { fontSize: 10, color: '#FFF', lineHeight: 14 },
  main: { flex: 1, padding: 14 },
  mainTitle: { color: '#2D5A3D', fontSize: 11 },
  body: { fontSize: 10, lineHeight: 15, color: '#333' },
});
