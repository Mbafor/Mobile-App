import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  type DateOrDateTime,
  type OnEventResponse,
} from '@howljs/calendar-kit';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
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
import {
  formatTimeForDb,
  SLOT_DURATION_MINUTES,
  snapToSlot,
  toggleInputFromAvailableEvent,
} from '@/features/mentorship/utils/calendar-slot-utils';
import { isActiveSessionStatus } from '@/features/mentorship/utils/session-rules';
import type { MentorshipSession } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type CoachSchedulingCalendarProps = {
  coachId: string;
  sessions: MentorshipSession[];
  isLoadingSessions?: boolean;
};

export function CoachSchedulingCalendar({
  coachId,
  sessions,
  isLoadingSessions,
}: CoachSchedulingCalendarProps) {
  const { mentorshipColors } = useTheme();
  const styles = useAppThemedStyles(createStyles);
  const calendarTheme = useMemo(
    () => createMentorshipCalendarTheme(mentorshipColors),
    [mentorshipColors],
  );
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const { slots, toggleSlot, isToggling, isLoading: slotsLoading } = useAvailabilitySlots(coachId);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const events = useMemo(() => {
    const availability = buildAvailabilityEvents(slots);
    const booked = buildSessionEvents(
      sessions.filter((s) => s.status !== 'cancelled'),
      { editableBooked: false },
    );
    return mergeCalendarEvents(availability, booked);
  }, [slots, sessions]);

  const onPressBackground = useCallback(
    (props: DateOrDateTime) => {
      if (!props.dateTime || isToggling) return;
      const { start, end, dayOfWeek } = snapToSlot(new Date(props.dateTime));
      const booked = sessions.some((s) => {
        if (!isActiveSessionStatus(s.status)) return false;
        const sStart = new Date(s.scheduledStart).getTime();
        const sEnd = new Date(s.scheduledEnd).getTime();
        return start.getTime() < sEnd && end.getTime() > sStart;
      });
      if (booked) return;

      void toggleSlot({
        dayOfWeek,
        startTime: formatTimeForDb(start),
        endTime: formatTimeForDb(end),
        timezone,
      }).catch((e: Error) => Alert.alert('Availability', e.message));
    },
    [slots, sessions, toggleSlot, isToggling, timezone],
  );

  const onPressEvent = useCallback(
    (event: OnEventResponse) => {
      const meta = parseEventMeta(event);
      if (meta?.kind === 'available' || event.id?.startsWith('avail-')) {
        const input = toggleInputFromAvailableEvent(event, slots, timezone);
        if (!input || isToggling) return;
        void toggleSlot(input).catch((e: Error) => Alert.alert('Availability', e.message));
        return;
      }
      if (meta?.kind === 'booked') {
        Alert.alert(
          'Booked session',
          'Confirmed and pending sessions cannot be edited on the calendar.',
        );
      }
    },
    [slots, timezone, toggleSlot, isToggling],
  );

  const loading = slotsLoading || isLoadingSessions;

  return (
    <View style={styles.wrap}>
      <View style={styles.toolbar}>
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleBtn, viewMode === 'week' && styles.toggleBtnActive]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>
              Week
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, viewMode === 'day' && styles.toggleBtnActive]}
            onPress={() => setViewMode('day')}
          >
            <Text style={[styles.toggleText, viewMode === 'day' && styles.toggleTextActive]}>
              Day
            </Text>
          </Pressable>
        </View>
        <Text variant="caption" muted>
          Tap empty cells to add availability, or tap a green slot to remove it
        </Text>
      </View>

      <View style={styles.legend}>
        <LegendDot styles={styles} color={calendarColors.available} label="Available" />
        <LegendDot styles={styles} color={calendarColors.booked} label="Booked" />
        <LegendDot styles={styles} color={calendarColors.completed} label="Completed" />
      </View>

      {loading ? (
        <ActivityIndicator color={mentorshipColors.accent} style={styles.loader} />
      ) : (
        <View style={styles.calendarBox}>
          <CalendarContainer
            theme={calendarTheme}
            events={events}
            numberOfDays={viewMode === 'week' ? 7 : 1}
            timeInterval={SLOT_DURATION_MINUTES}
            scrollByDay={viewMode === 'day'}
            onPressBackground={onPressBackground}
            onPressEvent={onPressEvent}
            firstDay={1}
          >
            <CalendarHeader />
            <CalendarBody />
          </CalendarContainer>
        </View>
      )}
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
  toolbar: { gap: spacing.xs },
  toggleRow: { flexDirection: 'row', gap: spacing.xs },
  toggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: mentorshipColors.surface,
  },
  toggleBtnActive: { backgroundColor: mentorshipColors.accent },
  toggleText: { fontWeight: '600', color: mentorshipColors.text },
  toggleTextActive: { color: mentorshipColors.textOnAccent },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  calendarBox: { height: 420, borderRadius: 12, overflow: 'hidden' },
  loader: { marginVertical: spacing.lg },
});
}
