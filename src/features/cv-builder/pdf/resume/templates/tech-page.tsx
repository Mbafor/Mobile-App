import { Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import {
  experienceDateLine,
  getContactItems,
  getDisplayName,
  hasText,
  parseBulletLines,
} from '@/features/cv-builder/pdf/resume/resume-shared';
import {
  PdfAchievementBlocks,
  PdfReferenceBlocks,
  PdfSection,
} from '@/features/cv-builder/pdf/resume/resume-sections';
import type { CVContent } from '@/types/domain/cv';

const styles = StyleSheet.create({
  page: { flexDirection: 'row', fontFamily: 'Helvetica', fontSize: 9 },
  sidebar: {
    width: '32%',
    backgroundColor: '#1E2A3A',
    color: '#FFFFFF',
    padding: 24,
    paddingTop: 28,
  },
  main: { width: '68%', padding: 28, color: '#111827' },
  sidebarName: { fontSize: 16, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase' },
  sidebarText: { fontSize: 8.5, marginBottom: 4, lineHeight: 1.35 },
  sidebarTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginTop: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sidebarBullet: { fontSize: 8.5, marginBottom: 2 },
  eduDate: { fontSize: 8, opacity: 0.85 },
  eduSchool: { fontSize: 8.5, fontWeight: 700, marginTop: 2 },
  mainTitle: { fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' },
  sectionTitle: { fontSize: 10, fontWeight: 700, marginBottom: 4, color: '#1E2A3A' },
  body: { fontSize: 9, lineHeight: 1.35 },
  techDate: { fontSize: 8, fontWeight: 700, color: '#3B82F6', marginBottom: 2 },
  techCompany: { fontSize: 10, fontWeight: 700 },
  techRole: { fontSize: 9, marginBottom: 2 },
});

function TechTimeline({ data }: { data: CVContent }) {
  if (!data.experience.length) return null;
  return (
    <PdfSection title="Experience" titleStyle={styles.sectionTitle}>
      {data.experience.map((entry) => (
        <View key={entry.id} style={{ marginBottom: 8 }}>
          <Text style={styles.techDate}>
            {experienceDateLine(entry).toUpperCase()}
          </Text>
          <Text style={styles.techCompany}>{entry.company}</Text>
          <Text style={styles.techRole}>{entry.role}</Text>
          {parseBulletLines(entry.description).map((line, index) => (
            <Text key={`${entry.id}-${index}`} style={styles.body}>
              • {line}
            </Text>
          ))}
        </View>
      ))}
    </PdfSection>
  );
}

function TechProjects({ data }: { data: CVContent }) {
  if (!data.projects.length) return null;
  return (
    <PdfSection title="Projects" titleStyle={styles.sectionTitle}>
      {data.projects.map((entry) => (
        <View key={entry.id} style={{ marginBottom: 6 }}>
          <Text style={{ fontWeight: 700 }}>{entry.name}</Text>
          {hasText(entry.technologies) ? <Text style={styles.body}>{entry.technologies}</Text> : null}
          {parseBulletLines(entry.description).map((line, index) => (
            <Text key={`${entry.id}-${index}`} style={styles.body}>
              • {line}
            </Text>
          ))}
        </View>
      ))}
    </PdfSection>
  );
}

export function TechResumePage({ data }: { data: CVContent }) {
  const contacts = getContactItems(data);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.sidebar}>
        <Text style={styles.sidebarName}>{getDisplayName(data)}</Text>
        {contacts.map((item) => (
          <Text key={item} style={styles.sidebarText}>
            {item}
          </Text>
        ))}

        {data.education.length ? (
          <View>
            <Text style={styles.sidebarTitle}>Education</Text>
            {data.education.map((entry) => (
              <View key={entry.id} style={{ marginBottom: 6 }}>
                <Text style={styles.eduDate}>{entry.endDate}</Text>
                <Text style={styles.eduSchool}>{entry.school.toUpperCase()}</Text>
                <Text style={styles.sidebarText}>{entry.degree}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {data.skills.length ? (
          <View>
            <Text style={styles.sidebarTitle}>Skills</Text>
            {data.skills.map((skill) => (
              <Text key={skill} style={styles.sidebarBullet}>
                • {skill}
              </Text>
            ))}
          </View>
        ) : null}

        {data.certifications.some((c) => c.name.trim()) ? (
          <View>
            <Text style={styles.sidebarTitle}>Certifications</Text>
            {data.certifications
              .filter((c) => c.name.trim())
              .map((entry) => (
                <Text key={entry.id} style={styles.sidebarBullet}>
                  • {entry.name}
                </Text>
              ))}
          </View>
        ) : null}

        {data.languages.some((l) => l.language.trim()) ? (
          <View>
            <Text style={styles.sidebarTitle}>Languages</Text>
            {data.languages
              .filter((l) => l.language.trim())
              .map((entry) => (
                <Text key={entry.id} style={styles.sidebarText}>
                  {entry.language}
                  {entry.proficiency ? ` (${entry.proficiency})` : ''}
                </Text>
              ))}
          </View>
        ) : null}
      </View>

      <View style={styles.main}>
        {hasText(data.summary) ? (
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.mainTitle}>Profile</Text>
            <Text style={styles.body}>{data.summary}</Text>
          </View>
        ) : null}

        <TechTimeline data={data} />
        <TechProjects data={data} />

        {data.achievements.length ? (
          <PdfSection title="Achievements" titleStyle={styles.sectionTitle}>
            <PdfAchievementBlocks entries={data.achievements} style={styles.body} />
          </PdfSection>
        ) : null}

        {data.references.length ? (
          <PdfSection title="References" titleStyle={styles.sectionTitle}>
            <PdfReferenceBlocks entries={data.references} style={styles.body} />
          </PdfSection>
        ) : null}
      </View>
    </Page>
  );
}
