import { Page, StyleSheet, View } from '@react-pdf/renderer';

import {
  PdfAchievementBlocks,
  PdfCertBullets,
  PdfEducationStandardBlocks,
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
  page: { padding: 36, fontSize: 9, fontFamily: 'Helvetica', color: '#1F2937' },
  header: { marginBottom: 10, borderBottomWidth: 3, borderBottomColor: '#3B82F6', paddingBottom: 8 },
  name: { fontSize: 18, fontWeight: 700, color: '#1F2937', marginBottom: 4 },
  contact: { fontSize: 9, color: '#4B5563' },
  sectionTitle: { color: '#3B82F6', fontSize: 10, fontWeight: 700 },
  body: { fontSize: 9, lineHeight: 1.4, color: '#374151' },
  summary: { fontSize: 9, lineHeight: 1.45, color: '#374151' },
  skillLabel: { fontWeight: 700, color: '#1F2937' },
});

export function ModernResumePage({ data }: { data: CVContent }) {
  return (
    <Page size="A4" style={styles.page}>
      <PdfHeaderBlock
        content={data}
        containerStyle={styles.header}
        nameStyle={styles.name}
        contactStyle={styles.contact}
      />

      <PdfSummarySection
        content={data}
        title="PROFESSIONAL PROFILE"
        titleStyle={styles.sectionTitle}
        bodyStyle={styles.summary}
      />

      {data.experience.length ? (
        <PdfSection title="PROFESSIONAL EXPERIENCE" titleStyle={styles.sectionTitle}>
          <PdfExperienceBlocks entries={data.experience} bodyStyle={styles.body} />
        </PdfSection>
      ) : null}

      {data.projects.length ? (
        <PdfSection title="PROJECTS" titleStyle={styles.sectionTitle}>
          <PdfProjectBlocks entries={data.projects} bodyStyle={styles.body} />
        </PdfSection>
      ) : null}

      {data.education.length ? (
        <PdfSection title="EDUCATION" titleStyle={styles.sectionTitle}>
          <PdfEducationStandardBlocks entries={data.education} bodyStyle={styles.body} />
        </PdfSection>
      ) : null}

      {data.skills.length ? (
        <PdfSection title="SKILLS" titleStyle={styles.sectionTitle}>
          <PdfSkillsSplit skills={data.skills} labelStyle={styles.skillLabel} textStyle={styles.body} />
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
        <PdfSection title="ACHIEVEMENTS" titleStyle={styles.sectionTitle}>
          <PdfAchievementBlocks entries={data.achievements} style={styles.body} />
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
