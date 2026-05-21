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

export function MinimalTemplatePreview({ content }: { content: CVContent }) {
  const contact = buildContactLine(content);
  const name = content.personalInfo.fullName.trim() || 'Your Name';

  return (
    <View style={styles.page}>
      <Text style={styles.name}>{name}</Text>
      {hasText(contact) ? <Text style={styles.contact}>{contact}</Text> : null}

      {hasText(content.summary) ? (
        <PreviewSection title="Summary" titleStyle={styles.label}>
          <Text style={styles.light}>{content.summary}</Text>
        </PreviewSection>
      ) : null}

      {content.experience.map((e) => (
        <PreviewEntry
          key={e.id}
          heading={e.role}
          subheading={e.company}
          meta={formatExperienceDates(e.startDate, e.endDate, e.currentlyWorking)}
          body={e.description}
          headingStyle={styles.light}
        />
      ))}

      {content.education.length > 0 ? (
        <PreviewSection title="Education" titleStyle={styles.label}>
          {content.education.map((ed) => (
            <PreviewEntry
              key={ed.id}
              heading={ed.school}
              subheading={`${ed.degree} ${ed.fieldOfStudy}`.trim()}
              meta={[ed.startDate, ed.endDate].filter(hasText).join(' – ')}
            />
          ))}
        </PreviewSection>
      ) : null}

      {content.skills.length > 0 ? (
        <Text style={styles.inline}>{content.skills.join('  ·  ')}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: 28, backgroundColor: '#FAFAFA' },
  name: {
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 2,
    color: '#111',
    textTransform: 'uppercase',
  },
  contact: { fontSize: 9, color: '#888', marginTop: 8, marginBottom: 24, letterSpacing: 0.5 },
  label: {
    fontSize: 9,
    fontWeight: '400',
    color: '#AAA',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  light: { fontWeight: '400', color: '#333' },
  inline: { fontSize: 10, color: '#666', marginTop: 12 },
});
