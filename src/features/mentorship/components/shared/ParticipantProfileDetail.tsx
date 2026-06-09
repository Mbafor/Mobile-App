import { StyleSheet, View } from 'react-native';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';

import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import { Text } from '@/components/ui';
import { TagList } from '@/features/mentorship/components/shared/TagList';
import type { MentorProfile, MentorshipParticipantProfile } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type ParticipantProfileDetailProps = {
  profile: MentorshipParticipantProfile;
  mentorProfile?: MentorProfile | null;
  roleLabel?: string;
  compact?: boolean;
};

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  const styles = useAppThemedStyles(createStyles);
  if (!value?.trim()) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function ParticipantProfileDetail({
  profile,
  mentorProfile,
  roleLabel,
  compact = false,
}: ParticipantProfileDetailProps) {
  const styles = useAppThemedStyles(createStyles);
  const name = profile.fullName?.trim() || 'Unknown';
  const interests = [...new Set([...profile.interests, ...(mentorProfile?.mentoringInterests ?? [])])];
  const career = [
    ...new Set([...profile.careerInterests, ...(mentorProfile?.mentoringCareerAreas ?? [])]),
  ];
  const majors = [
    ...new Set([
      ...(profile.courseMajor ? [profile.courseMajor] : []),
      ...(mentorProfile?.mentoringMajors ?? []),
    ]),
  ];
  const skills = [...new Set([...(mentorProfile?.mentoringDegreeLevels ?? []), ...majors])];

  return (
    <View style={styles.flat}>
      <View style={styles.hero}>
        <UserAvatarDisplay displayName={name} avatarUrl={profile.avatarUrl ?? null} size={compact ? 56 : 72} />
        <View style={styles.heroMeta}>
          {roleLabel ? <Text style={styles.role}>{roleLabel}</Text> : null}
          <Text style={styles.name}>{name}</Text>
          {profile.email ? <Text style={styles.sub}>{profile.email}</Text> : null}
        </View>
      </View>

      <View style={styles.details}>
        <DetailRow label="Country" value={profile.country} />
        <DetailRow label="University" value={profile.university} />
        <DetailRow label="Major / program" value={profile.courseMajor} />
        <DetailRow label="Degree level" value={profile.degreeLevel} />
      </View>

      {majors.length > 0 ? <TagList label="Academic focus" items={majors.slice(0, 12)} /> : null}
      {career.length > 0 ? <TagList label="Career interests" items={career.slice(0, 12)} /> : null}
      {interests.length > 0 ? <TagList label="Interests" items={interests.slice(0, 12)} /> : null}
      {skills.length > 0 && !compact ? (
        <TagList label="Skills & focus areas" items={skills.slice(0, 12)} />
      ) : null}

      {mentorProfile?.bio ? (
        <View style={styles.bioBlock}>
          <Text style={styles.bioLabel}>About</Text>
          <Text style={styles.bio}>{mentorProfile.bio}</Text>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  flat: {
    gap: spacing.md,
  },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroMeta: { flex: 1, gap: 4 },
  role: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: mentorshipColors.accent,
  },
  name: { fontSize: 20, fontWeight: '700', color: mentorshipColors.text },
  sub: { fontSize: 13, color: mentorshipColors.textMuted },
  details: { gap: spacing.sm },
  row: { gap: 2 },
  rowLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: mentorshipColors.textMuted,
  },
  rowValue: { fontSize: 15, color: mentorshipColors.text, fontWeight: '500' },
  bioBlock: { gap: spacing.xs },
  bioLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: mentorshipColors.textMuted,
  },
  bio: { fontSize: 15, lineHeight: 22, color: mentorshipColors.text },
});
}
