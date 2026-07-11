import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  if (rules.length === 0) {
    return (
      <Text muted>
        {t('mentorship.student.booking.noAvailability')}
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
      Alert.alert(t('mentorship.student.booking.sessionRequestedTitle'), t('mentorship.student.booking.panelConfirmMessage'));
    } catch (e) {
      Alert.alert(t('mentorship.student.booking.bookingFailedTitle'), e instanceof Error ? e.message : t('mentorship.student.booking.tryAgain'));
    }
  };

  return (
    <View style={styles.wrap}>
      <Text muted variant="caption">
        {t('mentorship.student.booking.panelHint')}
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
