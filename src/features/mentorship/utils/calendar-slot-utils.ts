import type { OnEventResponse } from '@howljs/calendar-kit';

import { calendarColors } from '@/features/mentorship/constants/calendar-colors';
import type { AvailabilitySlot } from '@/types/domain/mentorship';

export const SLOT_DURATION_MINUTES = 30;

const DOW_TO_RRULE: Record<number, string> = {
  0: 'SU',
  1: 'MO',
  2: 'TU',
  3: 'WE',
  4: 'TH',
  5: 'FR',
  6: 'SA',
};

const WEEKDAY_TO_DOW: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function snapToSlot(date: Date): { start: Date; end: Date; dayOfWeek: number } {
  const start = new Date(date);
  start.setSeconds(0, 0);
  const minutes = start.getMinutes();
  const snapped = Math.floor(minutes / SLOT_DURATION_MINUTES) * SLOT_DURATION_MINUTES;
  start.setMinutes(snapped);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + SLOT_DURATION_MINUTES);
  return { start, end, dayOfWeek: start.getDay() };
}

export function formatTimeForDb(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}:00`;
}

export function slotKey(dayOfWeek: number, startTime: string, endTime: string): string {
  return `${dayOfWeek}-${startTime.slice(0, 5)}-${endTime.slice(0, 5)}`;
}

export function parseAvailabilitySlotId(eventId: string | undefined): string | null {
  if (!eventId?.startsWith('avail-')) return null;
  return eventId.slice('avail-'.length) || null;
}

export function isAvailableCalendarEvent(event: OnEventResponse): boolean {
  if (parseAvailabilitySlotId(event.id)) return true;
  if (event.title === 'Available') return true;
  if (event.color === calendarColors.available) return true;
  return false;
}

export function findMatchingAvailabilitySlot(
  slots: AvailabilitySlot[],
  dayOfWeek: number,
  startTime: string,
  endTime: string,
): AvailabilitySlot | undefined {
  const startKey = startTime.slice(0, 5);
  const endKey = endTime.slice(0, 5);
  return slots.find(
    (s) =>
      s.dayOfWeek === dayOfWeek &&
      s.startTime.slice(0, 5) === startKey &&
      s.endTime.slice(0, 5) === endKey,
  );
}

function getZonedDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  const weekday = pick('weekday').replace(/\.$/, '');
  return {
    year: Number(pick('year')),
    month: Number(pick('month')),
    day: Number(pick('day')),
    hour: Number(pick('hour')),
    minute: Number(pick('minute')),
    dayOfWeek: WEEKDAY_TO_DOW[weekday] ?? date.getDay(),
  };
}

/** Map an occurrence instant to the coach slot that covers it (weekly pattern). */
export function findSlotCoveringInstant(
  slots: AvailabilitySlot[],
  instant: Date,
): AvailabilitySlot | undefined {
  return slots.find((slot) => {
    const tz = slot.timezone || 'UTC';
    const parts = getZonedDateParts(instant, tz);
    if (parts.dayOfWeek !== slot.dayOfWeek) return false;
    const startKey = slot.startTime.slice(0, 5);
    const endKey = slot.endTime.slice(0, 5);
    const hm = `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
    return hm >= startKey && hm < endKey;
  });
}

function wallClockInZoneToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  let utcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  for (let i = 0; i < 4; i++) {
    const parts = getZonedDateParts(new Date(utcMs), timeZone);
    const diffMinutes =
      (hour - parts.hour) * 60 +
      (minute - parts.minute) +
      (day - parts.day) * 24 * 60 +
      (month - parts.month) * 30 * 24 * 60;
    utcMs -= diffMinutes * 60_000;
    if (diffMinutes === 0) break;
  }
  return new Date(utcMs);
}

/** Bookable UTC range for a tapped calendar occurrence and coach availability row. */
export function bookTimesForSlotOccurrence(
  occurrence: Date,
  slot: AvailabilitySlot,
): { scheduledStart: string; scheduledEnd: string; timezone: string } {
  const tz = slot.timezone || 'UTC';
  const { year, month, day } = getZonedDateParts(occurrence, tz);
  const [sh, sm] = slot.startTime.split(':').map(Number);
  const [eh, em] = slot.endTime.split(':').map(Number);
  const start = wallClockInZoneToUtc(year, month, day, sh, sm ?? 0, tz);
  const end = wallClockInZoneToUtc(year, month, day, eh, em ?? 0, tz);
  return {
    scheduledStart: start.toISOString(),
    scheduledEnd: end.toISOString(),
    timezone: tz,
  };
}

export type ToggleSlotInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
};

/** Resolve toggle payload when pressing a green availability event. */
export function toggleInputFromAvailableEvent(
  event: OnEventResponse,
  slots: AvailabilitySlot[],
  fallbackTimezone: string,
): ToggleSlotInput | null {
  if (!isAvailableCalendarEvent(event) || !event.start?.dateTime) return null;

  const slotId = parseAvailabilitySlotId(event.id);
  const slot = slotId ? slots.find((s) => s.id === slotId) : findSlotCoveringInstant(slots, new Date(event.start.dateTime));

  if (slot) {
    return {
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      timezone: slot.timezone || fallbackTimezone,
    };
  }

  const { start, end, dayOfWeek } = snapToSlot(new Date(event.start.dateTime));
  return {
    dayOfWeek,
    startTime: formatTimeForDb(start),
    endTime: formatTimeForDb(end),
    timezone: event.start.timeZone ?? fallbackTimezone,
  };
}

export type BookSlotPayload = {
  scheduledStart: string;
  scheduledEnd: string;
  timezone: string;
  label: string;
};

export function bookPayloadFromAvailableEvent(
  event: OnEventResponse,
  slots: AvailabilitySlot[],
  fallbackTimezone: string,
  formatLabel: (startIso: string, tz: string) => string,
): BookSlotPayload | null {
  if (!isAvailableCalendarEvent(event) || !event.start?.dateTime) return null;

  const occurrence = new Date(event.start.dateTime);
  const slotId = parseAvailabilitySlotId(event.id);
  const slot =
    (slotId ? slots.find((s) => s.id === slotId) : undefined) ??
    findSlotCoveringInstant(slots, occurrence);

  if (slot) {
    const times = bookTimesForSlotOccurrence(occurrence, slot);
    return {
      ...times,
      label: formatLabel(times.scheduledStart, times.timezone),
    };
  }

  const { start, end } = snapToSlot(occurrence);
  const tz = event.start.timeZone ?? fallbackTimezone;
  return {
    scheduledStart: start.toISOString(),
    scheduledEnd: end.toISOString(),
    timezone: tz,
    label: formatLabel(start.toISOString(), tz),
  };
}

export function availabilityRecurrenceRule(dayOfWeek: number): string {
  const byday = DOW_TO_RRULE[dayOfWeek] ?? 'MO';
  return `RRULE:FREQ=WEEKLY;BYDAY=${byday}`;
}

/** Anchor date for recurring weekly events (next occurrence of dayOfWeek). */
export function anchorDateForSlot(
  dayOfWeek: number,
  startTime: string,
  reference = new Date(),
): Date {
  const [h, m] = startTime.split(':').map(Number);
  const d = new Date(reference);
  let diff = dayOfWeek - d.getDay();
  if (diff < 0) diff += 7;
  if (diff === 0) {
    const probe = new Date(d);
    probe.setHours(h, m ?? 0, 0, 0);
    if (probe.getTime() <= reference.getTime()) diff = 7;
  }
  d.setDate(d.getDate() + diff);
  d.setHours(h, m ?? 0, 0, 0);
  return d;
}
