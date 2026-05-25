import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import { TagList } from '@/features/mentorship/components/shared/TagList';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import type { MentorProfile, MentorshipParticipantProfile } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type CoachDashboardSummaryProps = {
  profile: MentorshipParticipantProfile | null;
  mentor: MentorProfile | null;
  onViewProfile?: () => void;
};

export function CoachDashboardSummary({ profile, mentor, onViewProfile }: CoachDashboardSummaryProps) {
  if (!profile) {
    return (
      <View style={styles.card}>
        <Text muted>Loading coach details…</Text>
      </View>
    );
  }

  const name = profile.fullName?.trim() || 'Your coach';
  const interests = [
    ...new Set([
      ...profile.interests,
      ...(mentor?.mentoringInterests ?? []),
      ...(mentor?.mentoringCareerAreas ?? []),
    ]),
  ].filter(Boolean);

  return (
    <Pressable style={styles.card} onPress={onViewProfile} disabled={!onViewProfile}>
      <View style={styles.row}>
        <UserAvatarDisplay displayName={name} avatarUrl={profile.avatarUrl ?? null} size={56} />
        <View style={styles.meta}>
          <Text style={styles.label}>Your coach</Text>
          <Text style={styles.name}>{name}</Text>
          {profile.university ? <Text style={styles.sub}>{profile.university}</Text> : null}
          {profile.courseMajor ? (
            <Text style={styles.sub}>{profile.courseMajor}</Text>
          ) : null}
        </View>
      </View>
      {interests.length > 0 ? (
        <TagList label="Interests & focus" items={interests.slice(0, 6)} />
      ) : null}
      {onViewProfile ? (
        <Text style={styles.link}>View full profile →</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: mentorshipColors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: mentorshipColors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  meta: { flex: 1, gap: 2 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: mentorshipColors.textMuted,
    letterSpacing: 0.4,
  },
  name: { fontSize: 18, fontWeight: '700', color: mentorshipColors.text },
  sub: { fontSize: 13, color: mentorshipColors.textMuted },
  link: { fontSize: 13, fontWeight: '600', color: mentorshipColors.accent },
});
