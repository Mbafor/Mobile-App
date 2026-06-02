import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  type OnEventResponse,
} from '@howljs/calendar-kit';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { mentorshipCalendarTheme } from '@/features/mentorship/components/calendar/calendar-theme';
import { calendarColors } from '@/features/mentorship/constants/calendar-colors';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import { useAvailabilitySlots } from '@/features/mentorship/hooks/useAvailabilitySlots';
import {
  buildAvailabilityEvents,
  buildSessionEvents,
  mergeCalendarEvents,
} from '@/features/mentorship/utils/calendar-events';
import {
  bookPayloadFromAvailableEvent,
  SLOT_DURATION_MINUTES,
} from '@/features/mentorship/utils/calendar-slot-utils';
import { formatDayOfWeek } from '@/features/mentorship/utils/format-availability';
import { formatSessionDateTime } from '@/features/mentorship/utils/format-session';
import type { MentorshipSession } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type PendingBook = {
  scheduledStart: string;
  scheduledEnd: string;
  timezone: string;
  label: string;
  notes: string;
};

type StudentBookingCalendarProps = {
  coachId: string;
  coachName: string;
  mentorshipId: string;
  sessions: MentorshipSession[];
  onBook: (input: {
    mentorshipId: string;
    scheduledStart: string;
    scheduledEnd: string;
    timezone: string;
    notes?: string;
  }) => Promise<void>;
  isBooking?: boolean;
  isLoadingSessions?: boolean;
};

export function StudentBookingCalendar({
  coachId,
  coachName,
  mentorshipId,
  sessions,
  onBook,
  isBooking,
  isLoadingSessions,
}: StudentBookingCalendarProps) {
  const { slots, isLoading: slotsLoading } = useAvailabilitySlots(coachId);
  const [pending, setPending] = useState<PendingBook | null>(null);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const events = useMemo(() => {
    const availability = buildAvailabilityEvents(slots);
    const booked = buildSessionEvents(sessions, { peerName: coachName });
    return mergeCalendarEvents(availability, booked);
  }, [slots, sessions, coachName]);

  const onPressEvent = useCallback(
    (event: OnEventResponse) => {
      const payload = bookPayloadFromAvailableEvent(event, slots, timezone, (startIso, tz) => {
        const start = new Date(startIso);
        return `${formatDayOfWeek(start.getDay())} · ${formatSessionDateTime(startIso, tz)}`;
      });
      if (!payload) return;
      setPending({
        scheduledStart: payload.scheduledStart,
        scheduledEnd: payload.scheduledEnd,
        timezone: payload.timezone,
        label: payload.label,
        notes: '',
      });
    },
    [slots, timezone],
  );

  const confirmBook = async () => {
    if (!pending) return;
    try {
      await onBook({
        mentorshipId,
        scheduledStart: pending.scheduledStart,
        scheduledEnd: pending.scheduledEnd,
        timezone: pending.timezone,
        notes: pending.notes.trim() || undefined,
      });
      setPending(null);
      Alert.alert('Session requested', 'Your coach has been notified.');
    } catch (e) {
      Alert.alert('Booking failed', e instanceof Error ? e.message : 'Try again.');
    }
  };

  const loading = slotsLoading || isLoadingSessions;

  if (!slots.length && !loading) {
    return (
      <Text muted style={styles.empty}>
        Your coach has not opened any time slots yet. Message them to arrange a time.
      </Text>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text muted style={styles.hint}>
        Tap a green slot to book. Blue slots are already taken. You can only book one session at a time.
      </Text>
      <View style={styles.legend}>
        <LegendDot color={calendarColors.available} label="Available" />
        <LegendDot color={calendarColors.booked} label="Booked" />
      </View>

      {loading ? (
        <ActivityIndicator color={mentorshipColors.accent} style={styles.loader} />
      ) : (
        <View style={styles.calendarBox}>
          <CalendarContainer
            theme={mentorshipCalendarTheme}
            events={events}
            numberOfDays={7}
            timeInterval={SLOT_DURATION_MINUTES}
            onPressEvent={onPressEvent}
            firstDay={1}
          >
            <CalendarHeader />
            <CalendarBody />
          </CalendarContainer>
        </View>
      )}

      <Modal visible={pending != null} transparent animationType="fade" onRequestClose={() => setPending(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPending(null)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Book a session?</Text>
            {pending ? (
              <>
                <Text muted style={styles.modalBody}>
                  Book a session with {coachName} on {pending.label}?
                </Text>
                <View style={styles.notesWrap}>
                  <Text variant="caption" muted>
                    My notes
                  </Text>
                  <Input
                    value={pending.notes}
                    onChangeText={(value) =>
                      setPending((prev) => (prev ? { ...prev, notes: value } : prev))
                    }
                    placeholder="Add a short note for your coach (optional)"
                    multiline
                    numberOfLines={3}
                    maxLength={220}
                  />
                </View>
              </>
            ) : null}
            <View style={styles.modalActions}>
              <Button variant="ghost" onPress={() => setPending(null)}>
                Cancel
              </Button>
              <Button onPress={() => void confirmBook()} loading={isBooking}>
                Confirm
              </Button>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="caption" muted>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  hint: { fontSize: 13 },
  empty: { padding: spacing.lg, textAlign: 'center' },
  legend: { flexDirection: 'row', gap: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  calendarBox: { height: 420, borderRadius: 12, overflow: 'hidden' },
  loader: { marginVertical: spacing.lg },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: mentorshipColors.surfaceElevated,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: mentorshipColors.text },
  modalBody: { lineHeight: 22 },
  notesWrap: { gap: spacing.xs },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
});
