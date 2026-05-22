import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import {
  BulletList,
  getContactItems,
  renderAchievements,
  renderExperienceTech,
  renderProjectsTech,
  renderReferencesFull,
} from '@/features/cv-builder/templates/shared/primitives';
import { hasText } from '@/features/cv-builder/components/preview/preview-shared';
import type { CVContent } from '@/types/domain/cv';

function SidebarBlock({ title, children }: { title: string; children: ReactNode }) {
  if (!children) return null;
  return (
    <View style={st.sidebarBlock}>
      <Text style={st.sidebarHeading}>{title}</Text>
      <View style={st.sidebarRule} />
      {children}
    </View>
  );
}

/** Tech — 35% navy sidebar, 65% grey main, timeline blocks. */
export function TechTemplate({ content }: { content: CVContent }) {
  const name = content.personalInfo.fullName.trim() || 'Your Name';
  const contacts = getContactItems(content);

  return (
    <View style={st.page}>
      <View style={st.sidebar}>
        <SidebarBlock title="CONTACT">
          {contacts.map((c) => (
            <Text key={c} style={st.sidebarText}>
              {c}
            </Text>
          ))}
        </SidebarBlock>

        {content.education.length > 0 ? (
          <SidebarBlock title="EDUCATION">
            {content.education.map((e) => (
              <View key={e.id} style={st.eduItem}>
                <Text style={st.eduDate}>{e.endDate}</Text>
                <Text style={st.eduSchool}>{e.school.toUpperCase()}</Text>
                <Text style={st.sidebarText}>{e.degree}</Text>
              </View>
            ))}
          </SidebarBlock>
        ) : null}

        {content.skills.length > 0 ? (
          <SidebarBlock title="SKILLS">
            {content.skills.map((s) => (
              <Text key={s} style={st.sidebarBullet}>
                • {s}
              </Text>
            ))}
          </SidebarBlock>
        ) : null}

        {content.certifications.some((c) => c.name.trim()) ? (
          <SidebarBlock title="CERTIFICATIONS">
            {content.certifications
              .filter((c) => c.name.trim())
              .map((c) => (
                <Text key={c.id} style={st.sidebarBullet}>
                  • {c.name}
                </Text>
              ))}
          </SidebarBlock>
        ) : null}

        {content.languages.length > 0 ? (
          <SidebarBlock title="LANGUAGES">
            {content.languages.map((l) => (
              <View key={l.id} style={st.langRow}>
                <Text style={st.sidebarText}>{l.language}</Text>
                <Text style={st.langLevel}>{l.proficiency}</Text>
              </View>
            ))}
          </SidebarBlock>
        ) : null}

        {content.hobbies.length > 0 ? (
          <SidebarBlock title="INTERESTS">
            <Text style={st.sidebarText}>{content.hobbies.join(', ')}</Text>
          </SidebarBlock>
        ) : null}
      </View>

      <View style={st.main}>
        <Text style={st.name}>{name.toUpperCase()}</Text>
        <View style={st.nameBar} />

        {hasText(content.summary) ? (
          <View style={st.mainSection}>
            <Text style={st.mainHeading}>PROFILE</Text>
            <View style={st.mainRule} />
            <Text style={st.body}>{content.summary}</Text>
          </View>
        ) : null}

        {content.experience.length > 0 ? (
          <View style={st.mainSection}>
            <Text style={st.mainHeading}>WORK EXPERIENCE</Text>
            <View style={st.mainRule} />
            {renderExperienceTech(content.experience, {
              company: st.blockTitle,
              role: st.blockSub,
              date: st.blockDate,
              body: st.body,
            })}
          </View>
        ) : null}

        {content.projects.length > 0 ? (
          <View style={st.mainSection}>
            <Text style={st.mainHeading}>KEY PROJECTS</Text>
            <View style={st.mainRule} />
            {renderProjectsTech(content.projects, {
              title: st.blockTitle,
              date: st.blockDate,
              body: st.body,
              tag: st.tag,
              tagText: st.tagText,
            })}
          </View>
        ) : null}

        {content.voluntaryExperience.length > 0 ? (
          <View style={st.mainSection}>
            <Text style={st.mainHeading}>VOLUNTEER EXPERIENCE</Text>
            <View style={st.mainRule} />
            {renderExperienceTech(content.voluntaryExperience, {
              company: st.blockTitle,
              role: st.blockSub,
              date: st.blockDate,
              body: st.body,
            })}
          </View>
        ) : null}

        {content.achievements.length > 0 ? (
          <View style={st.mainSection}>
            <Text style={st.mainHeading}>ACHIEVEMENTS</Text>
            <View style={st.mainRule} />
            {content.achievements.map((a) => (
              <View key={a.id} style={st.achItem}>
                <Text style={st.achTitle}>• {a.title}</Text>
                {hasText(a.date) ? <Text style={st.achDate}>{a.date}</Text> : null}
                {hasText(a.description) ? (
                  <BulletList text={a.description} bodyStyle={st.body} dotStyle={{ color: '#4b5563' }} />
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {content.references.length > 0 ? (
          <View style={st.mainSection}>
            <Text style={st.mainHeading}>REFERENCES</Text>
            <View style={st.mainRule} />
            {renderReferencesFull(content.references, {
              name: st.blockTitle,
              sub: st.blockSub,
              meta: st.body,
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  page: { flexDirection: 'row', minHeight: 520, backgroundColor: '#FFFFFF' },
  sidebar: { width: '35%', backgroundColor: '#1e2a3a', padding: 18 },
  sidebarBlock: { marginTop: 16 },
  sidebarHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sidebarRule: { height: 1, backgroundColor: 'rgba(255,255,255,0.4)', marginVertical: 8 },
  sidebarText: { fontSize: 9.5, color: '#d1d5db', marginBottom: 4, lineHeight: 13 },
  sidebarBullet: { fontSize: 9.5, color: '#d1d5db', marginBottom: 3 },
  eduItem: { marginBottom: 12 },
  eduDate: { fontSize: 9.5, fontWeight: '700', color: '#FFFFFF' },
  eduSchool: { fontSize: 9.5, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  langRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  langLevel: { fontSize: 9, color: '#9ca3af' },
  main: { flex: 1, backgroundColor: '#e5e7eb', padding: 22, paddingTop: 28 },
  name: { fontSize: 28, fontWeight: '700', color: '#374151', letterSpacing: 1.5 },
  nameBar: { width: 48, height: 4, backgroundColor: '#374151', marginVertical: 12 },
  mainSection: { marginBottom: 16 },
  mainHeading: { fontSize: 11, fontWeight: '700', color: '#1e2a3a', letterSpacing: 2 },
  mainRule: { height: 1, backgroundColor: '#9ca3af', marginVertical: 8 },
  blockTitle: { fontSize: 11, fontWeight: '700', color: '#111827' },
  blockSub: { fontSize: 10, fontWeight: '600', color: '#4b5563', marginBottom: 4 },
  blockDate: { fontSize: 9, color: '#6b7280', fontWeight: '700', textAlign: 'right', marginBottom: 4 },
  body: { fontSize: 10, lineHeight: 15, color: '#4b5563', textAlign: 'justify' },
  tag: { backgroundColor: '#d1d5db', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 8, color: '#1f2937' },
  achItem: { marginBottom: 8 },
  achTitle: { fontSize: 11, fontWeight: '700', color: '#111827' },
  achDate: { fontSize: 9, color: '#6b7280', marginLeft: 10, marginTop: 2 },
});
