import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import {
  BulletList,
  getContactItems,
  renderAchievements,
  renderExperienceStandard,
  renderProjectsStandard,
  renderReferencesFull,
} from '@/features/cv-builder/templates/shared/primitives';
import { hasText } from '@/features/cv-builder/components/preview/preview-shared';
import type { CVContent } from '@/types/domain/cv';

function RailSection({ title, children }: { title: string; children: ReactNode }) {
  if (!children) return null;
  return (
    <View style={ex.railSection}>
      <View style={ex.railLine} />
      <View style={ex.railRow}>
        <View style={ex.railLeft}>
          <Text style={ex.railTitle}>{title}</Text>
        </View>
        <View style={ex.railRight}>{children}</View>
      </View>
    </View>
  );
}

/** Executive (Jessica) — powder-blue contact banner, centered name, 25/75 rail sections. */
export function ExecutiveTemplate({ content }: { content: CVContent }) {
  const name = content.personalInfo.fullName.trim() || 'Your Name';
  const contacts = getContactItems(content);

  return (
    <View style={ex.page}>
      <View style={ex.banner}>
        {contacts.map((c, i) => (
          <View key={c} style={ex.bannerItem}>
            {i > 0 ? <Text style={ex.bannerSep}>|</Text> : null}
            <Text style={ex.bannerText}>{c}</Text>
          </View>
        ))}
      </View>

      <Text style={ex.name}>{name.toUpperCase()}</Text>

      {hasText(content.summary) ? (
        <RailSection title="SUMMARY">
          <Text style={ex.summary}>{content.summary}</Text>
        </RailSection>
      ) : null}

      {content.skills.length > 0 ? (
        <RailSection title="SKILLS">
          <View style={ex.skillGrid}>
            {content.skills.map((s) => (
              <View key={s} style={ex.skillCell}>
                <Text style={ex.skillDot}>•</Text>
                <Text style={ex.skillText}>{s}</Text>
              </View>
            ))}
          </View>
        </RailSection>
      ) : null}

      {content.experience.length > 0 ? (
        <RailSection title="WORK HISTORY">
          {content.experience.map((e) => (
            <View key={e.id} style={ex.jobBlock}>
              <View style={ex.jobHeader}>
                <View style={ex.jobLeft}>
                  <Text style={ex.jobTitle}>{e.role}</Text>
                  <Text style={ex.company}>
                    {e.company}
                    {hasText(e.location) ? ` - ${e.location}` : ''}
                  </Text>
                </View>
                <Text style={ex.jobDate}>
                  {e.startDate} - {e.currentlyWorking ? 'Present' : e.endDate || 'Present'}
                </Text>
              </View>
              <BulletList text={e.description} bodyStyle={ex.jobBody} />
            </View>
          ))}
        </RailSection>
      ) : null}

      {content.projects.length > 0 ? (
        <RailSection title="PROJECTS">
          {renderProjectsStandard(content.projects, {
            title: ex.jobTitle,
            date: ex.jobDate,
            body: ex.jobBody,
            tech: ex.company,
          })}
        </RailSection>
      ) : null}

      {content.education.length > 0 ? (
        <RailSection title="EDUCATION">
          {content.education.map((e) => (
            <View key={e.id} style={ex.jobBlock}>
              <View style={ex.jobHeader}>
                <View style={ex.jobLeft}>
                  <Text style={ex.jobTitle}>
                    {e.degree}
                    {hasText(e.fieldOfStudy) ? ` in ${e.fieldOfStudy}` : ''}
                  </Text>
                  <Text style={ex.company}>{e.school}</Text>
                </View>
                <Text style={ex.jobDate}>{e.endDate}</Text>
              </View>
            </View>
          ))}
        </RailSection>
      ) : null}

      {content.voluntaryExperience.length > 0 ? (
        <RailSection title="VOLUNTEER">
          {renderExperienceStandard(content.voluntaryExperience, {
            title: ex.jobTitle,
            sub: ex.company,
            date: ex.jobDate,
            body: ex.jobBody,
          })}
        </RailSection>
      ) : null}

      {content.achievements.length > 0 ? (
        <RailSection title="AWARDS">
          {renderAchievements(content.achievements, {
            title: ex.jobTitle,
            date: ex.jobDate,
            body: ex.jobBody,
          })}
        </RailSection>
      ) : null}

      {content.references.length > 0 ? (
        <RailSection title="REFERENCES">
          {renderReferencesFull(content.references, {
            name: ex.jobTitle,
            sub: ex.company,
            meta: ex.jobBody,
          })}
        </RailSection>
      ) : null}
    </View>
  );
}

const ex = StyleSheet.create({
  page: { backgroundColor: '#FFFFFF', paddingBottom: 20 },
  banner: {
    backgroundColor: '#dbeafe',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  bannerItem: { flexDirection: 'row', alignItems: 'center' },
  bannerSep: { marginHorizontal: 6, color: '#3b82f6', fontWeight: '700' },
  bannerText: { fontSize: 9, color: '#1f2937', fontWeight: '500' },
  name: {
    fontSize: 30,
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 28,
    paddingHorizontal: 24,
  },
  railSection: { marginBottom: 18, paddingHorizontal: 24 },
  railLine: { height: 2, backgroundColor: '#bfdbfe', marginBottom: 10 },
  railRow: { flexDirection: 'row' },
  railLeft: { width: '25%', paddingRight: 8 },
  railTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: 14,
  },
  railRight: { width: '75%' },
  summary: { fontSize: 10, lineHeight: 16, color: '#000000', textAlign: 'justify' },
  skillGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  skillCell: { width: '50%', flexDirection: 'row', marginBottom: 4, paddingRight: 8 },
  skillDot: { marginRight: 6, fontSize: 10, color: '#000' },
  skillText: { fontSize: 10, color: '#000', flex: 1 },
  jobBlock: { marginBottom: 12 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  jobLeft: { flex: 1, paddingRight: 12 },
  jobTitle: { fontSize: 11, fontWeight: '700', color: '#000000' },
  company: { fontSize: 10, color: '#4b5563', fontStyle: 'italic' },
  jobDate: { fontSize: 9, color: '#000000', textTransform: 'uppercase', textAlign: 'right', maxWidth: 100 },
  jobBody: { fontSize: 10, lineHeight: 15, color: '#000000', marginTop: 4 },
});
