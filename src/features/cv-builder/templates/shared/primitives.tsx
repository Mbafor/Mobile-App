import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { formatExperienceDates, hasText } from '@/features/cv-builder/components/preview/preview-shared';
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

// ─── Contact helpers ───────────────────────────────────────────────────────────

export function getContactItems(content: CVContent): string[] {
  const p = content.personalInfo;
  return [p.email, p.phone, p.location, p.linkedIn, p.website].filter(hasText);
}

export function ContactCentered({ items, textStyle, sepStyle }: { items: string[]; textStyle: object; sepStyle: object }) {
  if (items.length === 0) return null;
  return (
    <View style={pr.contactCenter}>
      {items.map((item, i) => (
        <View key={item} style={pr.contactInline}>
          {i > 0 ? <Text style={sepStyle}> | </Text> : null}
          <Text style={textStyle}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function ContactRow({ items, textStyle, sepStyle }: { items: string[]; textStyle: object; sepStyle: object }) {
  if (items.length === 0) return null;
  return (
    <View style={pr.contactRow}>
      {items.map((item, i) => (
        <View key={item} style={pr.contactInline}>
          {i > 0 ? <Text style={sepStyle}>|</Text> : null}
          <Text style={textStyle}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Bullets & rows ──────────────────────────────────────────────────────────

export function BulletList({
  text,
  bodyStyle,
  dotStyle,
}: {
  text?: string;
  bodyStyle: object;
  dotStyle?: object;
}) {
  if (!hasText(text)) return null;
  const lines = text!
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.startsWith('•') || l.startsWith('-') ? l.slice(1).trim() : l));

  return (
    <View style={pr.bulletGroup}>
      {lines.map((line, i) => (
        <View key={i} style={pr.bulletRow}>
          <Text style={[pr.bulletDot, dotStyle]}>•</Text>
          <Text style={[bodyStyle, pr.bulletBody]}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

export function RowWithDate({
  title,
  subtitle,
  date,
  titleStyle,
  subStyle,
  dateStyle,
}: {
  title: string;
  subtitle?: string;
  date?: string;
  titleStyle: object;
  subStyle?: object;
  dateStyle: object;
}) {
  if (!hasText(title) && !hasText(subtitle)) return null;
  return (
    <View style={pr.rowHeader}>
      <View style={pr.rowLeft}>
        {hasText(title) ? <Text style={titleStyle}>{title}</Text> : null}
        {hasText(subtitle) ? <Text style={subStyle}>{subtitle}</Text> : null}
      </View>
      {hasText(date) ? <Text style={dateStyle}>{date}</Text> : null}
    </View>
  );
}

export function Section({ title, titleStyle, children, style }: { title: string; titleStyle: object; children: ReactNode; style?: object }) {
  if (!children) return null;
  return (
    <View style={[pr.section, style]}>
      <Text style={titleStyle}>{title}</Text>
      {children}
    </View>
  );
}

export function SkillsTechnicalSoft({ skills, labelStyle, textStyle }: { skills: string[]; labelStyle: object; textStyle: object }) {
  if (skills.length === 0) return null;
  const half = Math.ceil(skills.length / 2);
  const technical = skills.slice(0, half);
  const soft = skills.slice(half);
  return (
    <>
      {technical.length > 0 ? (
        <View style={pr.skillRow}>
          <Text style={labelStyle}>Technical:</Text>
          <Text style={[textStyle, pr.skillValue]}>{technical.join(', ')}</Text>
        </View>
      ) : null}
      {soft.length > 0 ? (
        <View style={pr.skillRow}>
          <Text style={labelStyle}>Soft Skills:</Text>
          <Text style={[textStyle, pr.skillValue]}>{soft.join(', ')}</Text>
        </View>
      ) : null}
    </>
  );
}

// ─── Section renderers (field mapping matches website CVData) ────────────────

export function renderExperienceStandard(
  entries: CVExperienceEntry[],
  styles: { title: object; sub: object; date: object; body: object; block?: object },
) {
  return entries.map((e) => (
    <View key={e.id} style={[pr.itemBlock, styles.block]}>
      <RowWithDate
        title={e.role}
        subtitle={`${e.company}${hasText(e.location) ? ` — ${e.location}` : ''}`}
        date={formatExperienceDates(e.startDate, e.endDate, e.currentlyWorking)}
        titleStyle={styles.title}
        subStyle={styles.sub}
        dateStyle={styles.date}
      />
      <BulletList text={e.description} bodyStyle={styles.body} />
    </View>
  ));
}

/** Tech layout: company prominent, role as subtitle. */
export function renderExperienceTech(
  entries: CVExperienceEntry[],
  styles: { company: object; role: object; date: object; body: object },
) {
  return entries.map((e) => (
    <View key={e.id} style={pr.techTimeline}>
      <View style={pr.techDot} />
      <Text style={styles.date}>
        {formatExperienceDates(e.startDate, e.endDate, e.currentlyWorking).toUpperCase()}
      </Text>
      <Text style={styles.company}>{e.company}</Text>
      <Text style={styles.role}>{e.role}</Text>
      <BulletList text={e.description} bodyStyle={styles.body} dotStyle={{ color: '#374151' }} />
    </View>
  ));
}

export function renderProjectsStandard(
  entries: CVProjectEntry[],
  styles: { title: object; date: object; body: object; tech?: object },
) {
  return entries.map((p) => (
    <View key={p.id} style={pr.itemBlock}>
      <RowWithDate
        title={p.name}
        date={[p.startDate, p.endDate || 'Present'].filter(hasText).join(' – ')}
        titleStyle={styles.title}
        dateStyle={styles.date}
      />
      <BulletList text={p.description} bodyStyle={styles.body} />
      {hasText(p.technologies) ? (
        <Text style={styles.tech}>
          <Text style={pr.techBold}>Tech: </Text>
          {p.technologies}
        </Text>
      ) : null}
      {hasText(p.link) ? <Text style={pr.link}>{p.link}</Text> : null}
    </View>
  ));
}

export function renderProjectsTech(
  entries: CVProjectEntry[],
  styles: { title: object; date: object; body: object; tag: object; tagText: object },
) {
  return entries.map((p) => (
    <View key={p.id} style={pr.techTimeline}>
      <View style={pr.techDot} />
      <Text style={styles.date}>
        {[p.startDate, p.endDate || 'PRESENT'].filter(hasText).join(' - ').toUpperCase()}
      </Text>
      <Text style={styles.title}>{p.name}</Text>
      <BulletList text={p.description} bodyStyle={styles.body} dotStyle={{ color: '#374151' }} />
      {hasText(p.technologies) ? (
        <View style={pr.tagRow}>
          {p.technologies.split(',').map((t) => (
            <View key={t.trim()} style={styles.tag}>
              <Text style={styles.tagText}>{t.trim()}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  ));
}

export function renderEducationAts(
  entries: CVEducationEntry[],
  styles: { title: object; sub: object; date: object; body: object },
) {
  return entries.map((e) => (
    <View key={e.id} style={pr.itemBlock}>
      <RowWithDate
        title={`${e.degree}${hasText(e.fieldOfStudy) ? ` in ${e.fieldOfStudy}` : ''}`}
        subtitle={e.school}
        date={e.endDate}
        titleStyle={styles.title}
        subStyle={styles.sub}
        dateStyle={styles.date}
      />
      <BulletList
        text={[e.gpa ? `GPA: ${e.gpa}` : '', e.description].filter(hasText).join('\n')}
        bodyStyle={styles.body}
      />
    </View>
  ));
}

export function renderEducationStandard(
  entries: CVEducationEntry[],
  styles: { title: object; sub: object; date: object; body?: object },
) {
  return entries.map((e) => (
    <View key={e.id} style={pr.itemBlock}>
      <RowWithDate
        title={`${e.degree}${hasText(e.fieldOfStudy) ? ` in ${e.fieldOfStudy}` : ''}`}
        subtitle={e.school}
        date={[e.startDate, e.endDate].filter(hasText).join(' – ')}
        titleStyle={styles.title}
        subStyle={styles.sub}
        dateStyle={styles.date}
      />
      {hasText(e.description) ? (
        <BulletList text={e.description} bodyStyle={styles.body ?? styles.sub} />
      ) : null}
    </View>
  ));
}

export function renderAchievements(entries: CVAchievementEntry[], styles: { title: object; date: object; body: object }) {
  return entries.map((a) => (
    <View key={a.id} style={pr.itemBlock}>
      <RowWithDate title={a.title} date={a.date} titleStyle={styles.title} dateStyle={styles.date} />
      <BulletList text={a.description} bodyStyle={styles.body} />
    </View>
  ));
}

export function renderReferencesFull(entries: CVReferenceEntry[], styles: { name: object; sub: object; meta: object }) {
  return entries.map((r) => (
    <View key={r.id} style={pr.itemBlock}>
      <Text style={styles.name}>{r.name}</Text>
      <Text style={styles.sub}>
        {r.position}
        {hasText(r.company) ? ` at ${r.company}` : ''}
      </Text>
      {hasText(r.email) ? <Text style={styles.meta}>{r.email}</Text> : null}
      {hasText(r.phone) ? <Text style={styles.meta}>Phone: {r.phone}</Text> : null}
    </View>
  ));
}

export function renderCertBullets(entries: CVCertificationEntry[], style: object) {
  return entries
    .filter((c) => c.name.trim())
    .map((c) => (
      <Text key={c.id} style={[style, pr.certLine]}>
        • {c.name}
      </Text>
    ));
}

export function renderLanguagesLine(entries: CVLanguageEntry[], style: object) {
  const line = entries
    .filter((l) => l.language.trim())
    .map((l) => `${l.language}${hasText(l.proficiency) ? ` (${l.proficiency})` : ''}`)
    .join(', ');
  if (!line) return null;
  return <Text style={style}>{line}</Text>;
}

const pr = StyleSheet.create({
  contactCenter: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 2 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  contactInline: { flexDirection: 'row', alignItems: 'center' },
  section: { marginBottom: 10 },
  itemBlock: { marginBottom: 6 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  rowLeft: { flex: 1, paddingRight: 10 },
  bulletGroup: { marginTop: 2 },
  bulletRow: { flexDirection: 'row', marginBottom: 1 },
  bulletDot: { width: 10, fontSize: 10 },
  bulletBody: { flex: 1 },
  skillRow: { flexDirection: 'row', marginBottom: 2 },
  skillValue: { flex: 1 },
  techTimeline: {
    borderLeftWidth: 2,
    borderLeftColor: '#9ca3af',
    paddingLeft: 14,
    marginLeft: 5,
    marginBottom: 14,
    position: 'relative',
  },
  techDot: {
    position: 'absolute',
    left: -6,
    top: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1e2a3a',
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  techBold: { fontWeight: '700' },
  link: { fontSize: 9, color: '#1e2a3a', marginTop: 2 },
  certLine: { marginBottom: 3 },
});
