import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import {
  getContactItems,
  renderAchievements,
  renderExperienceStandard,
  renderProjectsStandard,
} from '@/features/cv-builder/templates/shared/primitives';
import { hasText } from '@/features/cv-builder/components/preview/preview-shared';
import type { CVContent } from '@/types/domain/cv';

/** Minimal Elite — 28% sidebar + 72% main, Swiss professional layout. */
export function MinimalTemplate({ content }: { content: CVContent }) {
  const name = content.personalInfo.fullName.trim() || 'Your Name';
  const contacts = getContactItems(content);
  const half = Math.ceil(content.skills.length / 2);
  const technical = content.skills.slice(0, half);
  const soft = content.skills.slice(half);

  return (
    <View style={mn.page}>
      <View style={mn.header}>
        <Text style={mn.name}>{name.toUpperCase()}</Text>
        <View style={mn.contactRow}>
          {contacts.map((c, i) => (
            <View key={c} style={mn.contactItem}>
              {i > 0 ? <Text style={mn.contactGap}>·</Text> : null}
              <Text style={mn.contact}>{c}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={mn.columns}>
        <View style={mn.sidebar}>
          {content.education.length > 0 ? (
            <View style={mn.sideSection}>
              <Text style={mn.sideTitle}>Education</Text>
              {content.education.map((e) => (
                <View key={e.id} style={mn.eduBlock}>
                  <Text style={mn.eduDegree}>{e.degree}</Text>
                  <Text style={mn.eduSchool}>{e.school}</Text>
                  <Text style={mn.eduDate}>{e.endDate}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {content.skills.length > 0 ? (
            <View style={mn.sideSection}>
              <Text style={mn.sideTitle}>Expertise</Text>
              {technical.length > 0 ? (
                <View style={mn.skillBlock}>
                  <Text style={mn.skillCat}>Technical</Text>
                  <Text style={mn.skillText}>{technical.join(', ')}</Text>
                </View>
              ) : null}
              {soft.length > 0 ? (
                <View style={mn.skillBlock}>
                  <Text style={mn.skillCat}>Professional</Text>
                  <Text style={mn.skillText}>{soft.join(', ')}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {content.certifications.some((c) => c.name.trim()) ? (
            <View style={mn.sideSection}>
              <Text style={mn.sideTitle}>Credentials</Text>
              {content.certifications
                .filter((c) => c.name.trim())
                .map((c) => (
                  <Text key={c.id} style={mn.skillText}>
                    • {c.name}
                  </Text>
                ))}
            </View>
          ) : null}

          {content.languages.length > 0 ? (
            <View style={mn.sideSection}>
              <Text style={mn.sideTitle}>Languages</Text>
              {content.languages.map((l) => (
                <Text key={l.id} style={mn.skillText}>
                  {l.language} — {l.proficiency}
                </Text>
              ))}
            </View>
          ) : null}

          {content.hobbies.length > 0 ? (
            <View style={mn.sideSection}>
              <Text style={mn.sideTitle}>Interests</Text>
              <Text style={mn.skillText}>{content.hobbies.join(', ')}</Text>
            </View>
          ) : null}

          {content.references.length > 0 ? (
            <View style={mn.sideSection}>
              <Text style={mn.sideTitle}>References</Text>
              {content.references.map((r) => (
                <View key={r.id} style={mn.refBlock}>
                  <Text style={mn.refName}>{r.name}</Text>
                  <Text style={mn.skillText}>{r.company}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={mn.main}>
          {hasText(content.summary) ? (
            <View style={mn.mainSection}>
              <Text style={mn.mainTitle}>Profile</Text>
              <Text style={mn.summary}>{content.summary}</Text>
            </View>
          ) : null}

          {content.experience.length > 0 ? (
            <View style={mn.mainSection}>
              <Text style={mn.mainTitle}>Experience</Text>
              {renderExperienceStandard(content.experience, {
                title: mn.blockTitle,
                sub: mn.blockSub,
                date: mn.blockDate,
                body: mn.body,
              })}
            </View>
          ) : null}

          {content.projects.length > 0 ? (
            <View style={mn.mainSection}>
              <Text style={mn.mainTitle}>Key Projects</Text>
              {renderProjectsStandard(content.projects, {
                title: mn.blockTitle,
                date: mn.blockDate,
                body: mn.body,
                tech: mn.tech,
              })}
            </View>
          ) : null}

          {content.voluntaryExperience.length > 0 ? (
            <View style={mn.mainSection}>
              <Text style={mn.mainTitle}>Volunteering</Text>
              {renderExperienceStandard(content.voluntaryExperience, {
                title: mn.blockTitle,
                sub: mn.blockSub,
                date: mn.blockDate,
                body: mn.body,
              })}
            </View>
          ) : null}

          {content.achievements.length > 0 ? (
            <View style={mn.mainSection}>
              <Text style={mn.mainTitle}>Achievements</Text>
              {renderAchievements(content.achievements, {
                title: mn.blockTitle,
                date: mn.blockDate,
                body: mn.body,
              })}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const mn = StyleSheet.create({
  page: { paddingVertical: 26, paddingHorizontal: 26, backgroundColor: '#FFFFFF' },
  header: {
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  name: { fontSize: 28, fontWeight: '700', color: '#111827', letterSpacing: 1.5 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, alignItems: 'center' },
  contactItem: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  contactGap: { marginRight: 6, color: '#9ca3af' },
  contact: { fontSize: 9, color: '#4b5563', letterSpacing: 0.3 },
  columns: { flexDirection: 'row' },
  sidebar: { width: '28%', paddingRight: 14 },
  sideSection: { marginBottom: 16 },
  sideTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: '#111827',
    paddingBottom: 3,
  },
  eduBlock: { marginBottom: 8 },
  eduDegree: { fontSize: 9.5, fontWeight: '700', color: '#1f2937' },
  eduSchool: { fontSize: 9, color: '#4b5563' },
  eduDate: { fontSize: 8.5, color: '#9ca3af', marginTop: 2 },
  skillBlock: { marginBottom: 8 },
  skillCat: { fontSize: 9, fontWeight: '700', color: '#374151', textTransform: 'uppercase', marginBottom: 2 },
  skillText: { fontSize: 9, color: '#4b5563', lineHeight: 13 },
  refBlock: { marginBottom: 6 },
  refName: { fontSize: 9, fontWeight: '700', color: '#374151' },
  main: { flex: 1, paddingLeft: 14, borderLeftWidth: 1, borderLeftColor: '#f3f4f6' },
  mainSection: { marginBottom: 16 },
  mainTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: '#111827',
    paddingBottom: 3,
  },
  summary: { fontSize: 10, lineHeight: 14, color: '#374151', textAlign: 'justify' },
  blockTitle: { fontSize: 10.5, fontWeight: '700', color: '#000000' },
  blockSub: { fontSize: 10, color: '#374151', fontStyle: 'italic' },
  blockDate: { fontSize: 9, color: '#6b7280', fontWeight: '700', textAlign: 'right' },
  body: { fontSize: 9.5, lineHeight: 13, color: '#374151' },
  tech: { fontSize: 8.5, color: '#6b7280', fontStyle: 'italic', marginTop: 2 },
});
