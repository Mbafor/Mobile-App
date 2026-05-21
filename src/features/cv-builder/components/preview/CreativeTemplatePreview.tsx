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

const ACCENT = '#6B4E9B';
const ACCENT_LIGHT = '#F0EBF7';

export function CreativeTemplatePreview({ content }: { content: CVContent }) {
  const contact = buildContactLine(content);
  const name = content.personalInfo.fullName.trim() || 'Your Name';

  return (
    <View style={styles.page}>
      <View style={styles.accentBar} />
      <View style={styles.inner}>
        <Text style={styles.name}>{name}</Text>
        {hasText(contact) ? <Text style={styles.contact}>{contact}</Text> : null}

        {hasText(content.summary) ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{content.summary}</Text>
          </View>
        ) : null}

        {content.experience.length > 0 ? (
          <PreviewSection title="Experience" titleStyle={styles.sectionTitle}>
            {content.experience.map((e) => (
              <View key={e.id} style={styles.card}>
                <PreviewEntry
                  heading={e.role}
                  subheading={e.company}
                  meta={formatExperienceDates(e.startDate, e.endDate, e.currentlyWorking)}
                  body={e.description}
                  headingStyle={{ color: ACCENT }}
                />
              </View>
            ))}
          </PreviewSection>
        ) : null}

        {content.education.length > 0 ? (
          <PreviewSection title="Education" titleStyle={styles.sectionTitle}>
            {content.education.map((e) => (
              <PreviewEntry
                key={e.id}
                heading={e.school}
                subheading={e.degree}
                meta={e.fieldOfStudy}
              />
            ))}
          </PreviewSection>
        ) : null}

        {content.skills.length > 0 ? (
          <View style={styles.skillRow}>
            {content.skills.map((s) => (
              <View key={s} style={styles.skillChip}>
                <Text style={styles.skillText}>{s}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {content.hobbies.length > 0 ? (
          <PreviewSection title="Interests" titleStyle={styles.sectionTitle}>
            <Text style={styles.small}>{content.hobbies.join(' · ')}</Text>
          </PreviewSection>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flexDirection: 'row', backgroundColor: '#FFF', minHeight: 400 },
  accentBar: { width: 8, backgroundColor: ACCENT },
  inner: { flex: 1, padding: 16 },
  name: { fontSize: 20, fontWeight: '800', color: ACCENT },
  contact: { fontSize: 10, color: '#666', marginTop: 4, marginBottom: 12 },
  pill: {
    backgroundColor: ACCENT_LIGHT,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  pillText: { fontSize: 10, lineHeight: 14, color: '#444' },
  sectionTitle: { color: ACCENT, fontSize: 11 },
  card: {
    backgroundColor: ACCENT_LIGHT,
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  skillChip: {
    backgroundColor: ACCENT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: { fontSize: 9, color: '#FFF', fontWeight: '600' },
  small: { fontSize: 10, color: '#555' },
});
