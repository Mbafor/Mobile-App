import { Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ReactNode } from 'react';

import { formatEducationDates, formatEducationTitle, hasText } from '@/features/cv-builder/pdf/resume/resume-shared';
import {
  PdfBulletList,
  PdfExperienceBlocks,
  PdfHeaderBlock,
  PdfProjectBlocks,
  PdfReferenceBlocks,
  PdfSkillsGrid,
} from '@/features/cv-builder/pdf/resume/resume-sections';
import type { CVContent } from '@/types/domain/cv';

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: '#111827' },
  banner: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
  },
  bannerName: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  bannerContact: { fontSize: 9 },
  bodyWrap: { padding: 28, paddingTop: 16 },
  railSection: { flexDirection: 'row', marginBottom: 10 },
  railLeft: { width: '28%', paddingRight: 8 },
  railRight: { width: '72%' },
  railTitle: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#2563EB',
    letterSpacing: 0.4,
  },
  body: { fontSize: 9, lineHeight: 1.35 },
  eduTitle: { fontWeight: 700 },
  eduSub: { marginTop: 1 },
  eduDate: { marginTop: 1, fontStyle: 'italic' },
});

function RailSection({ title, children }: { title: string; children: ReactNode }) {
  if (!children) return null;
  return (
    <View style={styles.railSection}>
      <View style={styles.railLeft}>
        <Text style={styles.railTitle}>{title}</Text>
      </View>
      <View style={styles.railRight}>{children}</View>
    </View>
  );
}

export function ExecutiveResumePage({ data }: { data: CVContent }) {
  return (
    <Page size="A4" style={styles.page}>
      <PdfHeaderBlock
        content={data}
        containerStyle={styles.banner}
        nameStyle={styles.bannerName}
        contactStyle={styles.bannerContact}
        separator=" | "
      />

      <View style={styles.bodyWrap}>
        {hasText(data.summary) ? (
          <RailSection title="Summary">
            <Text style={styles.body}>{data.summary}</Text>
          </RailSection>
        ) : null}

        {data.experience.length ? (
          <RailSection title="Experience">
            <PdfExperienceBlocks entries={data.experience} bodyStyle={styles.body} />
          </RailSection>
        ) : null}

        {data.projects.length ? (
          <RailSection title="Projects">
            <PdfProjectBlocks entries={data.projects} bodyStyle={styles.body} />
          </RailSection>
        ) : null}

        {data.education.length ? (
          <RailSection title="Education">
            {data.education.map((entry) => (
              <View key={entry.id} style={{ marginBottom: 6 }}>
                <Text style={styles.eduTitle}>{formatEducationTitle(entry)}</Text>
                <Text style={styles.eduSub}>{entry.school}</Text>
                <Text style={styles.eduDate}>{formatEducationDates(entry)}</Text>
                <PdfBulletList text={entry.description} style={styles.body} />
              </View>
            ))}
          </RailSection>
        ) : null}

        {data.skills.length ? (
          <RailSection title="Skills">
            <PdfSkillsGrid skills={data.skills} textStyle={styles.body} />
          </RailSection>
        ) : null}

        {data.references.length ? (
          <RailSection title="References">
            <PdfReferenceBlocks entries={data.references} style={styles.body} />
          </RailSection>
        ) : null}
      </View>
    </Page>
  );
}
