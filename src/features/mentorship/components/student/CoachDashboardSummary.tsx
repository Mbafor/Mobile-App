import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';

import { Text } from '@/components/ui';
import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import { TagList } from '@/features/mentorship/components/shared/TagList';
import type { MentorProfile, MentorshipParticipantProfile } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type CoachDashboardSummaryProps = {
  profile: MentorshipParticipantProfile | null;
  mentor: MentorProfile | null;
  onViewProfile?: () => void;
};

export function CoachDashboardSummary({ profile, mentor, onViewProfile }: CoachDashboardSummaryProps) {
  const styles = useAppThemedStyles(createStyles);
  if (!profile) {
    return (
      <View style={styles.card}>
        <Text muted>Loading coach details…</Text>
      </View>
    );
  }

  const name = profile.fullName?.trim() || 'Your coach';
  const isVerified = mentor?.status === 'approved';
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
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            {isVerified ? (
              <Ionicons name="checkmark-circle" size={17} color="#0B6623" style={styles.verifiedIcon} />
            ) : null}
          </View>
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

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
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
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 18, fontWeight: '700', color: mentorshipColors.text, flexShrink: 1 },
  verifiedIcon: { marginTop: 1 },
  sub: { fontSize: 13, color: mentorshipColors.textMuted },
  link: { fontSize: 13, fontWeight: '600', color: mentorshipColors.accent },
});
}
