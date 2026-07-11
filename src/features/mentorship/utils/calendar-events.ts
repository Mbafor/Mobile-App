import type { EventItem } from '@howljs/calendar-kit';

import i18n from '@/i18n';
import { calendarColors } from '@/features/mentorship/constants/calendar-colors';
import {
  anchorDateForSlot,
  availabilityRecurrenceRule,
  slotKey,
} from '@/features/mentorship/utils/calendar-slot-utils';
import { isPendingSessionStatus } from '@/features/mentorship/utils/session-rules';
import type { AvailabilitySlot, MentorshipSession } from '@/types/domain/mentorship';

export type CalendarEventKind = 'available' | 'booked' | 'completed' | 'cancelled';

export type MentorshipCalendarMeta = {
  kind: CalendarEventKind;
  slotId?: string;
  sessionId?: string;
  slotKey?: string;
};

function sessionColor(status: string): string {
  if (status === 'cancelled') return calendarColors.cancelled;
  if (status === 'completed') return calendarColors.completed;
  if (isPendingSessionStatus(status)) return calendarColors.booked;
  return calendarColors.booked;
}

function sessionTitle(session: MentorshipSession, peerName?: string): string {
  if (session.status === 'cancelled') return i18n.t('mentorship.calendarEvents.cancelled');
  if (session.status === 'completed') return i18n.t('mentorship.calendarEvents.completed');
  if (isPendingSessionStatus(session.status)) {
    return peerName
      ? i18n.t('mentorship.calendarEvents.bookedWithPeer', { peer: peerName })
      : i18n.t('mentorship.calendarEvents.booked');
  }
  return peerName
    ? i18n.t('mentorship.calendarEvents.sessionWithPeer', { peer: peerName })
    : i18n.t('mentorship.calendarEvents.session');
}

export function buildAvailabilityEvents(slots: AvailabilitySlot[]): EventItem[] {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  return slots.map((slot) => {
    const anchor = anchorDateForSlot(slot.dayOfWeek, slot.startTime);
    const [sh, sm] = slot.startTime.split(':').map(Number);
    const [eh, em] = slot.endTime.split(':').map(Number);
    const start = new Date(anchor);
    start.setHours(sh, sm ?? 0, 0, 0);
    const end = new Date(anchor);
    end.setHours(eh, em ?? 0, 0, 0);
    const key = slotKey(slot.dayOfWeek, slot.startTime, slot.endTime);
    return {
      id: `avail-${slot.id}`,
      title: i18n.t('mentorship.calendarEvents.available'),
      start: { dateTime: start.toISOString(), timeZone: slot.timezone || tz },
      end: { dateTime: end.toISOString(), timeZone: slot.timezone || tz },
      color: calendarColors.available,
      recurrence: availabilityRecurrenceRule(slot.dayOfWeek),
      meta: { kind: 'available', slotId: slot.id, slotKey: key } satisfies MentorshipCalendarMeta & {
        slotKey: string;
      },
    };
  });
}

export function buildSessionEvents(
  sessions: MentorshipSession[],
  options?: { peerName?: string; editableBooked?: boolean },
): EventItem[] {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  return sessions.map((session) => {
    const kind: CalendarEventKind =
      session.status === 'cancelled'
        ? 'cancelled'
        : session.status === 'completed'
          ? 'completed'
          : 'booked';
    return {
      id: `session-${session.id}`,
      title: sessionTitle(session, options?.peerName),
      start: { dateTime: session.scheduledStart, timeZone: session.timezone || tz },
      end: { dateTime: session.scheduledEnd, timeZone: session.timezone || tz },
      color: sessionColor(session.status),
      meta: { kind, sessionId: session.id } satisfies MentorshipCalendarMeta,
      // Booked sessions are not editable on coach calendar
      ...(kind === 'booked' && !options?.editableBooked ? { disableDrag: true, disablePress: false } : {}),
    };
  });
}

export function mergeCalendarEvents(
  availability: EventItem[],
  sessions: EventItem[],
): EventItem[] {
  const bookedKeys = new Set<string>();
  for (const ev of sessions) {
    const meta = ev.meta as MentorshipCalendarMeta | undefined;
    // Completed sessions are in the past — let the slot reopen.
    // Cancelled sessions must NOT reopen the slot (would flash green), but
    // also must NOT render as a visible event — they simply disappear.
    if (meta?.kind === 'completed') continue;
    const start = ev.start?.dateTime;
    if (!start) continue;
    const d = new Date(start);
    const end = ev.end?.dateTime ? new Date(ev.end.dateTime) : d;
    bookedKeys.add(
      slotKey(
        d.getDay(),
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
        `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`,
      ),
    );
  }

  const openAvailability = availability.filter((ev) => {
    const key = (ev.meta as MentorshipCalendarMeta | undefined)?.slotKey;
    return !key || !bookedKeys.has(key);
  });

  // Cancelled sessions are excluded from the rendered output — the slot just goes blank.
  const visibleSessions = sessions.filter((ev) => {
    const meta = ev.meta as MentorshipCalendarMeta | undefined;
    return meta?.kind !== 'cancelled';
  });

  return [...openAvailability, ...visibleSessions];
}

export function parseEventMeta(event: unknown): MentorshipCalendarMeta | null {
  const meta =
    event && typeof event === 'object' && 'meta' in event
      ? (event as { meta?: unknown }).meta
      : undefined;
  if (meta && typeof meta === 'object' && 'kind' in meta) {
    return meta as MentorshipCalendarMeta;
  }
  if (event && typeof event === 'object' && 'id' in event) {
    const id = (event as { id?: string }).id;
    if (id?.startsWith('avail-')) {
      return { kind: 'available', slotId: id.slice('avail-'.length) };
    }
    if (id?.startsWith('session-')) {
      return { kind: 'booked', sessionId: id.slice('session-'.length) };
    }
  }
  return null;
}
