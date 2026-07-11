import { Page, StyleSheet } from '@react-pdf/renderer';

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
import i18n from '@/i18n';

import type { CVContent } from '@/types/domain/cv';

const styles = StyleSheet.create({
  page: {
    paddingTop: 26,
    paddingBottom: 26,
    paddingHorizontal: 34,

    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: '#111827',
    lineHeight: 1.35,
  },

  // HEADER
  header: {
    alignItems: 'center',

    marginBottom: 8, // was 18
    paddingBottom: 8, // was 12

    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },

  name: {
    fontSize: 22,
    fontWeight: 700,

    marginBottom: 10, // increase separation
    letterSpacing: 0.6,
  },

  contact: {
    fontSize: 8.8,
    lineHeight: 1.2,

    color: '#4B5563',

    marginTop: 2, // prevents touching
  },

  // MAIN SECTION HEADERS
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: 700,

    marginTop: 4, // was 10
    marginBottom: 5, // was 8

    paddingBottom: 3,

    borderBottomWidth: 1,
    borderBottomColor: '#111827',

    letterSpacing: 1,
  },

  body: {
    fontSize: 9.3,

    lineHeight: 1.32, // tighter
    marginBottom: 3, // reduce section item spacing
  },

  summary: {
    fontSize: 9.4,

    lineHeight: 1.42,
    textAlign: 'left',

    marginBottom: 2,
  },

  skillLabel: {
    fontWeight: 700,
    marginRight: 3,
  },
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

      <PdfSummarySection
        content={data}
        titleStyle={styles.sectionTitle}
        bodyStyle={styles.summary}
      />

      {data.education.length ? (
        <PdfSection
          title={i18n.t('cvBuilder.pdf.sections.allCaps.education')}
          titleStyle={styles.sectionTitle}
        >
          <PdfEducationAtsBlocks
            entries={data.education}
            bodyStyle={styles.body}
          />
        </PdfSection>
      ) : null}

      {data.skills.length ? (
        <PdfSection
          title={i18n.t('cvBuilder.pdf.sections.allCaps.skills')}
          titleStyle={styles.sectionTitle}
        >
          <PdfSkillsSplit
            skills={data.skills}
            labelStyle={styles.skillLabel}
            textStyle={styles.body}
          />
        </PdfSection>
      ) : null}

      {data.experience.length ? (
        <PdfSection
          title={i18n.t('cvBuilder.pdf.sections.allCaps.experience')}
          titleStyle={styles.sectionTitle}
        >
          <PdfExperienceBlocks
            entries={data.experience}
            bodyStyle={styles.body}
          />
        </PdfSection>
      ) : null}

      {data.projects.length ? (
        <PdfSection
          title={i18n.t('cvBuilder.pdf.sections.allCaps.keyProjects')}
          titleStyle={styles.sectionTitle}
        >
          <PdfProjectBlocks
            entries={data.projects}
            bodyStyle={styles.body}
          />
        </PdfSection>
      ) : null}

      

      {data.certifications.some((c) => c.name.trim()) ? (
        <PdfSection
          title={i18n.t('cvBuilder.pdf.sections.allCaps.certifications')}
          titleStyle={styles.sectionTitle}
        >
          <PdfCertBullets
            entries={data.certifications}
            style={styles.body}
          />
        </PdfSection>
      ) : null}

      {data.languages.length ? (
        <PdfSection
          title={i18n.t('cvBuilder.pdf.sections.allCaps.languages')}
          titleStyle={styles.sectionTitle}
        >
          <PdfLanguageLines
            entries={data.languages}
            style={styles.body}
          />
        </PdfSection>
      ) : null}

      {data.achievements.length ? (
        <PdfSection
          title={i18n.t('cvBuilder.pdf.sections.allCaps.achievements')}
          titleStyle={styles.sectionTitle}
        >
          <PdfAchievementBlocks
            entries={data.achievements}
            style={styles.body}
          />
        </PdfSection>
      ) : null}

      {data.voluntaryExperience.length ? (
        <PdfSection
          title={i18n.t('cvBuilder.pdf.sections.allCaps.volunteer')}
          titleStyle={styles.sectionTitle}
        >
          <PdfExperienceBlocks
            entries={data.voluntaryExperience}
            bodyStyle={styles.body}
          />
        </PdfSection>
      ) : null}

      {data.references.length ? (
        <PdfSection
          title={i18n.t('cvBuilder.pdf.sections.allCaps.references')}
          titleStyle={styles.sectionTitle}
        >
          <PdfReferenceBlocks
            entries={data.references}
            style={styles.body}
          />
        </PdfSection>
      ) : null}

      {data.hobbies.length ? (
        <PdfSection
          title={i18n.t('cvBuilder.pdf.sections.allCaps.interests')}
          titleStyle={styles.sectionTitle}
        >
          <PdfHobbiesLine
            hobbies={data.hobbies}
            style={styles.body}
          />
        </PdfSection>
      ) : null}
    </Page>
  );
}