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

/* =========================
   IMPROVED STYLES
========================= */
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.4,
    color: '#111827',
  },

  /* ================= SIDEBAR ================= */
  sidebar: {
    width: '32%',
    backgroundColor: '#1E2A3A',
    color: '#FFFFFF',
    padding: 26,
    paddingTop: 30,
  },

  sidebarName: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 6,
    letterSpacing: 0.5,
  },

  sidebarText: {
    fontSize: 8.5,
    marginBottom: 3,
    lineHeight: 1.35,
    opacity: 0.9,
  },

  sidebarTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginTop: 14,
    marginBottom: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.95,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    paddingBottom: 4,
  },

  sidebarBullet: {
    fontSize: 8.5,
    marginBottom: 2,
    opacity: 0.9,
  },

  /* ================= MAIN ================= */
  main: {
    width: '68%',
    padding: 30,
    paddingTop: 28,
  },

  mainTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#1E2A3A',
  },

  sectionTitle: {
    fontSize: 10.5,
    fontWeight: 700,
    marginBottom: 8,
    marginTop: 14,
    color: '#1E2A3A',
    letterSpacing: 0.5,
  },

  body: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#111827',
  },

  /* ================= EXPERIENCE ================= */
  techDate: {
    fontSize: 8,
    fontWeight: 700,
    color: '#3B82F6',
    marginBottom: 2,
    letterSpacing: 0.5,
  },

  techCompany: {
    fontSize: 10.5,
    fontWeight: 700,
    marginBottom: 1,
  },

  techRole: {
    fontSize: 9,
    marginBottom: 4,
    color: '#374151',
  },
});

/* ================= EXPERIENCE ================= */
function TechTimeline({ data }: { data: CVContent }) {
  if (!data.experience.length) return null;

  return (
    <PdfSection title="Experience" titleStyle={styles.sectionTitle}>
      {data.experience.map((entry) => (
        <View key={entry.id} style={{ marginBottom: 12 }}>
          <Text style={styles.techDate}>
            {experienceDateLine(entry).toUpperCase()}
          </Text>

          <Text style={styles.techCompany}>{entry.company}</Text>

          <Text style={styles.techRole}>{entry.role}</Text>

          {parseBulletLines(entry.description).map((line, index) => (
            <Text
              key={`${entry.id}-${index}`}
              style={[styles.body, { marginBottom: 2 }]}
            >
              • {line}
            </Text>
          ))}
        </View>
      ))}
    </PdfSection>
  );
}

/* ================= PROJECTS ================= */
function TechProjects({ data }: { data: CVContent }) {
  if (!data.projects.length) return null;

  return (
    <PdfSection title="Projects" titleStyle={styles.sectionTitle}>
      {data.projects.map((entry) => (
        <View key={entry.id} style={{ marginBottom: 10 }}>
          <Text style={{ fontWeight: 700, fontSize: 10.5, marginBottom: 2 }}>
            {entry.name}
          </Text>

          {hasText(entry.technologies) ? (
            <Text style={styles.body}>{entry.technologies}</Text>
          ) : null}

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

/* ================= MAIN COMPONENT ================= */
export function TechResumePage({ data }: { data: CVContent }) {
  const contacts = getContactItems(data);

  return (
    <Page size="A4" style={styles.page}>
      {/* ================= SIDEBAR ================= */}
      <View style={styles.sidebar}>
        <Text style={styles.sidebarName}>{getDisplayName(data)}</Text>

        {contacts.map((item) => (
          <Text key={item} style={styles.sidebarText}>
            {item}
          </Text>
        ))}

        {data.education.length ? (
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.sidebarTitle}>Education</Text>

            {data.education.map((entry) => (
              <View key={entry.id} style={{ marginBottom: 10 }}>
                <Text style={styles.sidebarText}>{entry.endDate}</Text>

                <Text
                  style={[
                    styles.sidebarText,
                    { fontWeight: 700, textTransform: 'uppercase' },
                  ]}
                >
                  {entry.school}
                </Text>

                <Text style={styles.sidebarText}>{entry.degree}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {data.skills.length ? (
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.sidebarTitle}>Skills</Text>

            {data.skills.map((skill) => (
              <Text key={skill} style={styles.sidebarBullet}>
                • {skill}
              </Text>
            ))}
          </View>
        ) : null}

        {data.certifications.some((c) => c.name.trim()) ? (
          <View style={{ marginBottom: 10 }}>
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
          <View style={{ marginBottom: 10 }}>
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

      {/* ================= MAIN ================= */}
      <View style={styles.main}>
        {hasText(data.summary) ? (
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.mainTitle}>Profile</Text>
            <Text style={styles.body}>{data.summary}</Text>
          </View>
        ) : null}

        <TechTimeline data={data} />
        <TechProjects data={data} />

        {data.achievements.length ? (
          <PdfSection title="Achievements" titleStyle={styles.sectionTitle}>
            <PdfAchievementBlocks
              entries={data.achievements}
              style={styles.body}
            />
          </PdfSection>
        ) : null}

        {data.references.length ? (
          <PdfSection title="References" titleStyle={styles.sectionTitle}>
            <PdfReferenceBlocks
              entries={data.references}
              style={styles.body}
            />
          </PdfSection>
        ) : null}
      </View>
    </Page>
  );
}