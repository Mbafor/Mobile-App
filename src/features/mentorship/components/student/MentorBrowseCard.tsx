import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import { TagList } from '@/features/mentorship/components/shared/TagList';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import {
  getMentorAcademicFocus,
  getMentorInterestTags,
} from '@/features/mentorship/utils/mentor-card-tags';
import type { AvailableMentor } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type MentorBrowseCardProps = {
  mentor: AvailableMentor;
  onViewProfile: () => void;
};

function availabilityLabel(mentor: AvailableMentor): { text: string; tone: 'ok' | 'muted' | 'full' } {
  if (!mentor.isAcceptingStudents) {
    return { text: 'Not accepting students', tone: 'muted' };
  }
  if (!mentor.hasCapacity) {
    return { text: 'Currently at capacity', tone: 'full' };
  }
  return { text: 'Available', tone: 'ok' };
}

export function MentorBrowseCard({
  mentor,
  onViewProfile,
}: MentorBrowseCardProps) {
  const { profile } = mentor;
  const name = profile.fullName?.trim() || 'Coach';
  const academicFocus = getMentorAcademicFocus(mentor);
  const interests = getMentorInterestTags(mentor);
  const availability = availabilityLabel(mentor);

  const badgeStyle =
    availability.tone === 'ok'
      ? styles.badgeOk
      : availability.tone === 'full'
      ? styles.badgeFull
      : styles.badgeMuted;

  return (
    <View style={styles.card}>
      <Pressable onPress={onViewProfile} style={styles.pressable}>
        {/* Avatar */}
        <View style={styles.avatarRow}>
          <UserAvatarDisplay displayName={name} avatarUrl={profile.avatarUrl ?? null} size={72} />
        </View>

        {/* Name + badge */}
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <View style={[styles.badge, badgeStyle]}>
            <Text style={styles.badgeText}>{availability.text}</Text>
          </View>
        </View>

        {/* University */}
        {profile.university ? (
          <Text style={styles.university} numberOfLines={1}>{profile.university}</Text>
        ) : null}

        {/* Tags */}
        {academicFocus.length > 0 ? (
          <TagList label="Academic focus" items={academicFocus.slice(0, 4)} />
        ) : null}
        {interests.length > 0 ? (
          <TagList label="Interests" items={interests.slice(0, 4)} />
        ) : null}
      </Pressable>

      {/* Actions */}
      <View style={styles.actions}>
        <Button onPress={onViewProfile} style={styles.actionBtn}>
          View profile
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: mentorshipColors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: mentorshipColors.border,
  },
  pressable: { gap: spacing.sm },

  avatarRow: {
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },

  header: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: mentorshipColors.text,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeOk: { backgroundColor: mentorshipColors.accentMuted },
  badgeFull: { backgroundColor: '#FDECEC' },
  badgeMuted: { backgroundColor: '#F0F0F0' },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: mentorshipColors.accentDark,
  },

  university: {
    fontSize: 12,
    color: mentorshipColors.textMuted,
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: { flex: 1 },
});
