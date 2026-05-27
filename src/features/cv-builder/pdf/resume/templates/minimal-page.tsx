import { Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import { getDisplayName, hasText, splitSkills } from '@/features/cv-builder/pdf/resume/resume-shared';
import {
  PdfContactLine,
  PdfExperienceBlocks,
  PdfProjectBlocks,
  PdfSection,
} from '@/features/cv-builder/pdf/resume/resume-sections';
import type { CVContent } from '@/types/domain/cv';

const styles = StyleSheet.create({
  page: { flexDirection: 'row', fontFamily: 'Helvetica', fontSize: 9, color: '#111827' },
  sidebar: { width: '34%', padding: 24, paddingTop: 28, borderRightWidth: 1, borderRightColor: '#E5E7EB' },
  main: { width: '66%', padding: 24, paddingTop: 28 },
  name: { fontSize: 18, fontWeight: 700, marginBottom: 6 },
  contact: { fontSize: 8.5, lineHeight: 1.4, marginBottom: 12, color: '#4B5563' },
  sidebarLabel: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
  },
  sidebarText: { fontSize: 8.5, lineHeight: 1.35, marginBottom: 2 },
  eduDegree: { fontWeight: 700, fontSize: 9 },
  eduSchool: { fontSize: 8.5, marginTop: 1 },
  eduDate: { fontSize: 8, marginTop: 1, color: '#6B7280' },
  sectionTitle: { fontSize: 10, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' },
  body: { fontSize: 9, lineHeight: 1.35 },
  summary: { fontSize: 9, lineHeight: 1.45, marginBottom: 10 },
});

export function MinimalResumePage({ data }: { data: CVContent }) {
  const { technical, soft } = splitSkills(data.skills);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.sidebar}>
        <Text style={styles.name}>{getDisplayName(data)}</Text>
        <PdfContactLine content={data} style={styles.contact} separator=" · " />

        {data.education.length ? (
          <View>
            <Text style={styles.sidebarLabel}>Education</Text>
            {data.education.map((entry) => (
              <View key={entry.id} style={{ marginBottom: 6 }}>
                <Text style={styles.eduDegree}>{entry.degree}</Text>
                <Text style={styles.eduSchool}>{entry.school}</Text>
                <Text style={styles.eduDate}>{entry.endDate}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {technical.length ? (
          <View>
            <Text style={styles.sidebarLabel}>Technical</Text>
            <Text style={styles.sidebarText}>{technical.join(', ')}</Text>
          </View>
        ) : null}

        {soft.length ? (
          <View>
            <Text style={styles.sidebarLabel}>Soft Skills</Text>
            <Text style={styles.sidebarText}>{soft.join(', ')}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.main}>
        {hasText(data.summary) ? <Text style={styles.summary}>{data.summary}</Text> : null}

        {data.experience.length ? (
          <PdfSection title="Experience" titleStyle={styles.sectionTitle}>
            <PdfExperienceBlocks entries={data.experience} bodyStyle={styles.body} />
          </PdfSection>
        ) : null}

        {data.projects.length ? (
          <PdfSection title="Projects" titleStyle={styles.sectionTitle}>
            <PdfProjectBlocks entries={data.projects} bodyStyle={styles.body} />
          </PdfSection>
        ) : null}
      </View>
    </Page>
  );
}
