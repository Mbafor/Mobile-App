import { Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import {
  PdfAchievementBlocks,
  PdfCertBullets,
  PdfEducationAtsBlocks,
  PdfExperienceBlocks,
  PdfHeaderBlock,
  PdfHobbiesLine,
  PdfLanguageLines,
  PdfProjectBlocks,
  PdfReferenceBlocks,
  PdfSection,
  PdfSkillsSplit,
  PdfSummarySection,
} from '@/features/cv-builder/pdf/resume/resume-sections';
import type { CVContent } from '@/types/domain/cv';

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: 'Helvetica', color: '#111827' },
  header: { alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 20, fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 },
  contact: { fontSize: 9 },
  sectionTitle: { borderBottomWidth: 1, borderBottomColor: '#111827', paddingBottom: 2 },
  body: { fontSize: 9, lineHeight: 1.4 },
  summary: { fontSize: 9, lineHeight: 1.45, textAlign: 'justify' },
  skillLabel: { fontWeight: 700 },
});

export function AtsResumePage({ data }: { data: CVContent }) {
  return (
    <Page size="A4" style={styles.page}>
      <PdfHeaderBlock
        content={data}
        containerStyle={styles.header}
        nameStyle={styles.name}
        contactStyle={styles.contact}
      />

      <PdfSummarySection content={data} titleStyle={styles.sectionTitle} bodyStyle={styles.summary} />

      {data.education.length ? (
        <PdfSection title="EDUCATION" titleStyle={styles.sectionTitle}>
          <PdfEducationAtsBlocks entries={data.education} bodyStyle={styles.body} />
        </PdfSection>
      ) : null}

      {data.skills.length ? (
        <PdfSection title="SKILLS" titleStyle={styles.sectionTitle}>
          <PdfSkillsSplit skills={data.skills} labelStyle={styles.skillLabel} textStyle={styles.body} />
        </PdfSection>
      ) : null}

      {data.projects.length ? (
        <PdfSection title="KEY PROJECTS" titleStyle={styles.sectionTitle}>
          <PdfProjectBlocks entries={data.projects} bodyStyle={styles.body} />
        </PdfSection>
      ) : null}

      {data.experience.length ? (
        <PdfSection title="PROFESSIONAL EXPERIENCE" titleStyle={styles.sectionTitle}>
          <PdfExperienceBlocks entries={data.experience} bodyStyle={styles.body} />
        </PdfSection>
      ) : null}

      {data.certifications.some((c) => c.name.trim()) ? (
        <PdfSection title="CERTIFICATIONS" titleStyle={styles.sectionTitle}>
          <PdfCertBullets entries={data.certifications} style={styles.body} />
        </PdfSection>
      ) : null}

      {data.languages.length ? (
        <PdfSection title="LANGUAGES" titleStyle={styles.sectionTitle}>
          <PdfLanguageLines entries={data.languages} style={styles.body} />
        </PdfSection>
      ) : null}

      {data.achievements.length ? (
        <PdfSection title="ACHIEVEMENTS & AWARDS" titleStyle={styles.sectionTitle}>
          <PdfAchievementBlocks entries={data.achievements} style={styles.body} />
        </PdfSection>
      ) : null}

      {data.voluntaryExperience.length ? (
        <PdfSection title="VOLUNTEER EXPERIENCE" titleStyle={styles.sectionTitle}>
          <PdfExperienceBlocks entries={data.voluntaryExperience} bodyStyle={styles.body} />
        </PdfSection>
      ) : null}

      {data.references.length ? (
        <PdfSection title="REFERENCES" titleStyle={styles.sectionTitle}>
          <PdfReferenceBlocks entries={data.references} style={styles.body} />
        </PdfSection>
      ) : null}

      {data.hobbies.length ? (
        <PdfSection title="INTERESTS" titleStyle={styles.sectionTitle}>
          <PdfHobbiesLine hobbies={data.hobbies} style={styles.body} />
        </PdfSection>
      ) : null}
    </Page>
  );
}
