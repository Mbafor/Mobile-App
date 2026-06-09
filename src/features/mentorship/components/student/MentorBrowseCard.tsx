import { Ionicons } from '@expo/vector-icons';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import { spacing } from '@/constants/theme';
import {
  getMentorAcademicFocus,
  getMentorInterestTags,
} from '@/features/mentorship/utils/mentor-card-tags';
import type { AvailableMentor } from '@/types/domain/mentorship';

type MentorBrowseCardProps = {
  mentor: AvailableMentor;
  onViewProfile: () => void;
};

function availabilityText(mentor: AvailableMentor): { label: string; color: string } {
  if (!mentor.isAcceptingStudents) {
    return { label: 'Not accepting students', color: colors.textMuted };
  }
  if (!mentor.hasCapacity) {
    return { label: 'Currently full', color: '#B00020' };
  }
  return { label: 'Available', color: '#1B7F4E' };
}

export function MentorBrowseCard({ mentor, onViewProfile }: MentorBrowseCardProps) {
  const styles = useThemedStyles(createStyles);
  const { profile } = mentor;
  const name = profile.fullName?.trim() || 'Coach';
  const academicFocus = getMentorAcademicFocus(mentor);
  const interests = getMentorInterestTags(mentor);
  const allTags = [...academicFocus, ...interests].slice(0, 4);
  const credential = [profile.university, profile.degreeLevel].filter(Boolean).join(' · ');
  const availability = availabilityText(mentor);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onViewProfile}
      accessibilityRole="button"
    >
      <UserAvatarDisplay
        displayName={name}
        avatarUrl={profile.avatarUrl ?? null}
        size={48}
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>

        {credential ? (
          <Text style={styles.credential} numberOfLines={1}>{credential}</Text>
        ) : null}

        {allTags.length > 0 ? (
          <Text style={styles.tags} numberOfLines={2}>
            {allTags.join('  ·  ')}
          </Text>
        ) : null}

        <Text style={[styles.availability, { color: availability.color }]}>
          {availability.label}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.border} />
    </Pressable>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowPressed: { backgroundColor: colors.surface },

  info: { flex: 1, gap: 3, minWidth: 0 },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  credential: {
    fontSize: 14,
    color: colors.textMuted,
  },
  tags: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  availability: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
});
}
