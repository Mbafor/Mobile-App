import { StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ReactNode } from 'react';

import {
  achievementLine,
  experienceDateLine,
  experienceSubtitle,
  formatEducationDates,
  formatEducationTitle,
  getContactItems,
  getDisplayName,
  hasCertifications,
  hasLanguages,
  hasText,
  parseBulletLines,
  projectDateLine,
  referenceBlock,
  splitSkills,
} from '@/features/cv-builder/pdf/resume/resume-shared';
import type {
  CVAchievementEntry,
  CVCertificationEntry,
  CVContent,
  CVEducationEntry,
  CVExperienceEntry,
  CVLanguageEntry,
  CVProjectEntry,
  CVReferenceEntry,
} from '@/types/domain/cv';

type SectionProps = {
  title: string;
  children: ReactNode;
  titleStyle?: any;
  containerStyle?: any;
};

export function PdfSection({ title, children, titleStyle, containerStyle }: SectionProps) {
  if (!children) return null;
  return (
    <View style={[sectionStyles.section, containerStyle]}>
      <Text style={[sectionStyles.sectionTitle, titleStyle]}>{title}</Text>
      {children}
    </View>
  );
}

type RowProps = {
  title: string;
  subtitle?: string;
  date?: string;
  titleStyle?: any;
  subtitleStyle?: any;
  dateStyle?: any;
};

export function PdfRowHeader({ title, subtitle, date, titleStyle, subtitleStyle, dateStyle }: RowProps) {
  if (!hasText(title) && !hasText(subtitle)) return null;
  return (
    <View style={sectionStyles.rowHeader}>
      <View style={sectionStyles.rowLeft}>
        {hasText(title) ? <Text style={[sectionStyles.rowTitle, titleStyle]}>{title}</Text> : null}
        {hasText(subtitle) ? (
          <Text style={[sectionStyles.rowSub, subtitleStyle]}>{subtitle}</Text>
        ) : null}
      </View>
      {hasText(date) ? <Text style={[sectionStyles.rowDate, dateStyle]}>{date}</Text> : null}
    </View>
  );
}

export function PdfBulletList({ text, style }: { text?: string; style?: any }) {
  const lines = parseBulletLines(text);
  if (!lines.length) return null;
  return (
    <View style={sectionStyles.bulletWrap}>
      {lines.map((line, index) => (
        <Text key={`${index}-${line.slice(0, 12)}`} style={[sectionStyles.bullet, style]}>
          • {line}
        </Text>
      ))}
    </View>
  );
}

export function PdfContactLine({
  content,
  style,
  separator = ' | ',
}: {
  content: CVContent;
  style?: any;
  separator?: string;
}) {
  const items = getContactItems(content);
  if (!items.length) return null;
  return <Text style={style}>{items.join(separator)}</Text>;
}

export function PdfHeaderBlock({
  content,
  nameStyle,
  contactStyle,
  containerStyle,
  uppercaseName = true,
  separator = ' | ',
}: {
  content: CVContent;
  nameStyle?: any;
  contactStyle?: any;
  containerStyle?: any;
  uppercaseName?: boolean;
  separator?: string;
}) {
  const name = getDisplayName(content);
  return (
    <View style={containerStyle}>
      <Text style={nameStyle}>{uppercaseName ? name.toUpperCase() : name}</Text>
      <PdfContactLine content={content} style={contactStyle} separator={separator} />
    </View>
  );
}

export function PdfSummarySection({
  content,
  title = 'PROFESSIONAL SUMMARY',
  titleStyle,
  bodyStyle,
}: {
  content: CVContent;
  title?: string;
  titleStyle?: any;
  bodyStyle?: any;
}) {
  if (!hasText(content.summary)) return null;
  return (
    <PdfSection title={title} titleStyle={titleStyle}>
      <Text style={bodyStyle}>{content.summary}</Text>
    </PdfSection>
  );
}

export function PdfExperienceBlocks({
  entries,
  titleStyle,
  bodyStyle,
}: {
  entries: CVExperienceEntry[];
  titleStyle?: any;
  bodyStyle?: any;
}) {
  if (!entries.length) return null;
  return (
    <>
      {entries.map((entry) => (
        <View key={entry.id} style={sectionStyles.itemBlock}>
          <PdfRowHeader
            title={entry.role}
            subtitle={experienceSubtitle(entry)}
            date={experienceDateLine(entry)}
            titleStyle={titleStyle}
          />
          <PdfBulletList text={entry.description} style={bodyStyle} />
        </View>
      ))}
    </>
  );
}

export function PdfEducationAtsBlocks({
  entries,
  titleStyle,
  bodyStyle,
}: {
  entries: CVEducationEntry[];
  titleStyle?: any;
  bodyStyle?: any;
}) {
  if (!entries.length) return null;

  return (
    <>
      {entries.map((entry) => {
        const schoolLine = [
          entry.school,
          entry.gpa ? `• GPA: ${entry.gpa}` : '',
        ]
          .filter(hasText)
          .join(' ');

        return (
          <View key={entry.id} style={sectionStyles.itemBlock}>
            <PdfRowHeader
              title={formatEducationTitle(entry)}
              subtitle={schoolLine}
              date={entry.endDate}
              titleStyle={titleStyle}
            />

            {hasText(entry.description) ? (
              <PdfBulletList
                text={entry.description}
                style={bodyStyle}
              />
            ) : null}
          </View>
        );
      })}
    </>
  );
}

export function PdfEducationStandardBlocks({
  entries,
  titleStyle,
  bodyStyle,
}: {
  entries: CVEducationEntry[];
  titleStyle?: any;
  bodyStyle?: any;
}) {
  if (!entries.length) return null;
  return (
    <>
      {entries.map((entry) => (
        <View key={entry.id} style={sectionStyles.itemBlock}>
          <PdfRowHeader
            title={formatEducationTitle(entry)}
            subtitle={entry.school}
            date={formatEducationDates(entry)}
            titleStyle={titleStyle}
          />
          <PdfBulletList text={entry.description} style={bodyStyle} />
        </View>
      ))}
    </>
  );
}

export function PdfSkillsSplit({ skills, labelStyle, textStyle }: { skills: string[]; labelStyle?: any; textStyle?: any }) {
  if (!skills.length) return null;
  const { technical, soft } = splitSkills(skills);
  return (
    <View>
      {technical.length ? (
        <Text style={textStyle}>
          <Text style={labelStyle}>Technical: </Text>
          {technical.join(', ')}
        </Text>
      ) : null}
      {soft.length ? (
        <Text style={textStyle}>
          <Text style={labelStyle}>Soft Skills: </Text>
          {soft.join(', ')}
        </Text>
      ) : null}
    </View>
  );
}

export function PdfSkillsGrid({ skills, textStyle }: { skills: string[]; textStyle?: any }) {
  if (!skills.length) return null;
  return (
    <View style={sectionStyles.skillGrid}>
      {skills.map((skill) => (
        <Text key={skill} style={[sectionStyles.skillCell, textStyle]}>
          • {skill}
        </Text>
      ))}
    </View>
  );
}

export function PdfProjectBlocks({
  entries,
  titleStyle,
  bodyStyle,
}: {
  entries: CVProjectEntry[];
  titleStyle?: any;
  bodyStyle?: any;
}) {
  if (!entries.length) return null;
  return (
    <>
      {entries.map((entry) => (
        <View key={entry.id} style={sectionStyles.itemBlock}>
          <PdfRowHeader title={entry.name} date={projectDateLine(entry)} titleStyle={titleStyle} />
          {hasText(entry.technologies) ? (
            <Text style={bodyStyle}>{entry.technologies}</Text>
          ) : null}
          <PdfBulletList text={entry.description} style={bodyStyle} />
        </View>
      ))}
    </>
  );
}

export function PdfCertBullets({ entries, style }: { entries: CVCertificationEntry[]; style?: any }) {
  if (!hasCertifications(entries)) return null;
  return (
    <>
      {entries
        .filter((c) => hasText(c.name))
        .map((entry) => (
          <Text key={entry.id} style={style}>
            • {entry.name}
            {hasText(entry.issuer) ? ` — ${entry.issuer}` : ''}
            {hasText(entry.year) ? ` (${entry.year})` : ''}
          </Text>
        ))}
    </>
  );
}

export function PdfLanguageLines({ entries, style }: { entries: CVLanguageEntry[]; style?: any }) {
  if (!hasLanguages(entries)) return null;
  return (
    <>
      {entries
        .filter((l) => hasText(l.language))
        .map((entry) => (
          <Text key={entry.id} style={style}>
            {entry.language}
            {hasText(entry.proficiency) ? ` (${entry.proficiency})` : ''}
          </Text>
        ))}
    </>
  );
}

export function PdfAchievementBlocks({ entries, style }: { entries: CVAchievementEntry[]; style?: any }) {
  if (!entries.length) return null;
  return (
    <>
      {entries.map((entry) => (
        <View key={entry.id} style={sectionStyles.itemBlock}>
          <Text style={style}>{achievementLine(entry)}</Text>
          <PdfBulletList text={entry.description} style={style} />
        </View>
      ))}
    </>
  );
}

export function PdfReferenceBlocks({ entries, style }: { entries: CVReferenceEntry[]; style?: any }) {
  if (!entries.length) return null;
  return (
    <>
      {entries.map((entry) => (
        <Text key={entry.id} style={[sectionStyles.reference, style]}>
          {referenceBlock(entry)}
        </Text>
      ))}
    </>
  );
}

export function PdfHobbiesLine({ hobbies, style }: { hobbies: string[]; style?: any }) {
  if (!hobbies.length) return null;
  return <Text style={style}>{hobbies.join(', ')}</Text>;
}

const sectionStyles = StyleSheet.create({
  section: { marginBottom: 10 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  rowLeft: { flex: 1, paddingRight: 8 },
  rowTitle: { fontSize: 10, fontWeight: 700 },
  rowSub: { fontSize: 9, marginTop: 1 },
  rowDate: { fontSize: 9, textAlign: 'right' },
  itemBlock: { marginBottom: 6 },
  bulletWrap: { marginTop: 2 },
  bullet: { fontSize: 9, lineHeight: 1.35, marginBottom: 1 },
  skillGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  skillCell: { width: '50%', fontSize: 9, marginBottom: 2 },
  reference: { fontSize: 9, marginBottom: 4, lineHeight: 1.35 },
});
