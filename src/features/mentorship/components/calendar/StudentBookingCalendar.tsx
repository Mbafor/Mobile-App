import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  type OnEventResponse,
} from '@howljs/calendar-kit';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createMentorshipCalendarTheme } from '@/features/mentorship/components/calendar/calendar-theme';
import { useTheme } from '@/hooks/useTheme';
import { calendarColors } from '@/features/mentorship/constants/calendar-colors';
import { useAvailabilitySlots } from '@/features/mentorship/hooks/useAvailabilitySlots';
import {
  buildAvailabilityEvents,
  buildSessionEvents,
  mergeCalendarEvents,
  parseEventMeta,
} from '@/features/mentorship/utils/calendar-events';
import { canStudentCancelSession } from '@/features/mentorship/utils/session-rules';
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
  onCancel?: (sessionId: string) => void;
  isBooking?: boolean;
  isLoadingSessions?: boolean;
};

export function StudentBookingCalendar({
  coachId,
  coachName,
  mentorshipId,
  sessions,
  onBook,
  onCancel,
  isBooking,
  isLoadingSessions,
}: StudentBookingCalendarProps) {
  const { mentorshipColors } = useTheme();
  const styles = useAppThemedStyles(createStyles);
  const { t } = useTranslation();
  const calendarTheme = useMemo(
    () => createMentorshipCalendarTheme(mentorshipColors),
    [mentorshipColors],
  );
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
      // Tap on a booked session → offer cancellation
      const meta = parseEventMeta(event);
      if (meta?.kind === 'booked' && meta.sessionId) {
        const session = sessions.find((s) => s.id === meta.sessionId);
        if (session && canStudentCancelSession(session)) {
          Alert.alert(
            t('mentorship.calendar.cancelTitle'),
            formatSessionDateTime(session.scheduledStart, session.timezone),
            [
              { text: t('mentorship.calendar.keepIt'), style: 'cancel' },
              {
                text: t('mentorship.calendar.cancelSession'),
                style: 'destructive',
                onPress: () => onCancel?.(session.id),
              },
            ],
          );
          return;
        }
      }

      // Tap on an available slot → guard against double-booking
      const hasActive = sessions.some(
        (s) => s.status !== 'cancelled' && s.status !== 'completed',
      );
      if (hasActive) {
        Alert.alert(
          t('mentorship.calendar.alreadyBookedTitle'),
          t('mentorship.calendar.alreadyBookedMessage'),
        );
        return;
      }

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
    [slots, timezone, sessions, onCancel, t],
  );

  const confirmBook = async () => {
    if (!pending) return;
    if (!pending.notes.trim()) {
      Alert.alert(t('mentorship.calendar.notesRequiredTitle'), t('mentorship.calendar.notesRequiredMessage'));
      return;
    }
    try {
      await onBook({
        mentorshipId,
        scheduledStart: pending.scheduledStart,
        scheduledEnd: pending.scheduledEnd,
        timezone: pending.timezone,
        notes: pending.notes.trim(),
      });
      setPending(null);
      Alert.alert(t('mentorship.calendar.sessionRequestedTitle'), t('mentorship.calendar.sessionRequestedMessage'));
    } catch (e) {
      Alert.alert(t('mentorship.calendar.bookingFailedTitle'), e instanceof Error ? e.message : t('mentorship.calendar.tryAgain'));
    }
  };

  const loading = slotsLoading || isLoadingSessions;

  if (!slots.length && !loading) {
    return (
      <Text muted style={styles.empty}>
        {t('mentorship.calendar.noSlots')}
      </Text>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text muted style={styles.hint}>
        {t('mentorship.calendar.studentHint')}
      </Text>
      <View style={styles.legend}>
        <LegendDot styles={styles} color={calendarColors.available} label={t('mentorship.calendar.available')} />
        <LegendDot styles={styles} color={calendarColors.booked} label={t('mentorship.calendar.booked')} />
      </View>

      {loading ? (
        <ActivityIndicator color={mentorshipColors.accent} style={styles.loader} />
      ) : (
        <View style={styles.calendarBox}>
          <CalendarContainer
            theme={calendarTheme}
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
        <View style={styles.modalOverlay}>
          {/* Dimmed backdrop — tapping it dismisses the modal */}
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setPending(null)} />

          {/* Card sits as a sibling so taps inside never reach the backdrop */}
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('mentorship.calendar.bookTitle')}</Text>
            {pending ? (
              <>
                <Text muted style={styles.modalBody}>
                  {t('mentorship.calendar.bookConfirm', { name: coachName, label: pending.label })}
                </Text>
                <View style={styles.notesWrap}>
                  <Text variant="caption" muted>
                    {t('mentorship.calendar.shortNotes')} <Text style={styles.required}>*</Text>
                  </Text>
                  <Input
                    value={pending.notes}
                    onChangeText={(value) =>
                      setPending((prev) => (prev ? { ...prev, notes: value } : prev))
                    }
                    placeholder={t('mentorship.calendar.notesPlaceholder')}
                    multiline
                    numberOfLines={3}
                    maxLength={220}
                    autoFocus
                  />
                </View>
              </>
            ) : null}
            <View style={styles.modalActions}>
              <Button variant="ghost" onPress={() => setPending(null)}>
                {t('mentorship.calendar.cancel')}
              </Button>
              <Button onPress={() => void confirmBook()} loading={isBooking}>
                {t('mentorship.calendar.confirm')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function LegendDot({
  styles,
  color,
  label,
}: {
  styles: ReturnType<typeof createStyles>;
  color: string;
  label: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="caption" muted>
        {label}
      </Text>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  wrap: { gap: spacing.sm },
  hint: { fontSize: 13 },
  required: { color: colors.error },
  empty: { padding: spacing.lg, textAlign: 'center' },
  legend: { flexDirection: 'row', gap: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  calendarBox: { height: 420, borderRadius: 12, overflow: 'hidden' },
  loader: { marginVertical: spacing.lg },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
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
}
