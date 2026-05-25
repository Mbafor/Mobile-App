import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { MENTORSHIP_MAX_ACTIVE_MENTEES } from '@/features/mentorship/constants/mentorship';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import { colors, spacing } from '@/constants/theme';

type CapacityBadgeProps = {
  activeCount: number;
  maxStudents?: number;
};

export function CapacityBadge({ activeCount, maxStudents = MENTORSHIP_MAX_ACTIVE_MENTEES }: CapacityBadgeProps) {
  const atCapacity = activeCount >= maxStudents;

  return (
    <View style={[styles.badge, atCapacity && styles.badgeFull]}>
      <Text style={[styles.text, atCapacity && styles.textFull]}>
        {activeCount} / {maxStudents} active mentees
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: mentorshipColors.accentMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  badgeFull: { backgroundColor: '#FDECEC' },
  text: { color: mentorshipColors.accent, fontWeight: '600', fontSize: 13 },
  textFull: { color: colors.error },
});
