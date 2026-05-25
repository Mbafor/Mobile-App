import { Alert, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { buildNextSessionSlot } from '@/features/mentorship/utils/build-session-slot';
import { formatAvailabilityRule } from '@/features/mentorship/utils/format-availability';
import type { MentorAvailabilityRule } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type BookSessionPanelProps = {
  mentorshipId: string;
  userId: string;
  rules: MentorAvailabilityRule[];
  onBook: (input: {
    mentorshipId: string;
    createdBy: string;
    scheduledStart: string;
    scheduledEnd: string;
    timezone: string;
    title?: string;
  }) => Promise<void>;
  isBooking?: boolean;
};

export function BookSessionPanel({
  mentorshipId,
  userId,
  rules,
  onBook,
  isBooking,
}: BookSessionPanelProps) {
  if (rules.length === 0) {
    return (
      <Text muted>
        Your coach has not set availability yet. Message them to arrange a time.
      </Text>
    );
  }

  const bookFromRule = async (rule: MentorAvailabilityRule) => {
    try {
      const slot = buildNextSessionSlot(rule.dayOfWeek, rule.startTime, rule.endTime);
      await onBook({
        mentorshipId,
        createdBy: userId,
        ...slot,
        timezone: rule.timezone,
        title: 'Mentorship session',
      });
      Alert.alert('Session requested', 'Your coach will confirm the booking.');
    } catch (e) {
      Alert.alert('Booking failed', e instanceof Error ? e.message : 'Try again.');
    }
  };

  return (
    <View style={styles.wrap}>
      <Text muted variant="caption">
        Tap a slot to request your next session (coach confirms).
      </Text>
      {rules.map((rule) => (
        <Button
          key={rule.id}
          variant="secondary"
          onPress={() => void bookFromRule(rule)}
          loading={isBooking}
          style={styles.slotBtn}
        >
          {formatAvailabilityRule(rule.dayOfWeek, rule.startTime, rule.endTime, rule.timezone)}
        </Button>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  slotBtn: { marginBottom: spacing.xs },
});
