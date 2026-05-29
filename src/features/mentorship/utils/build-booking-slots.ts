import { formatDayOfWeek, formatTimeLabel } from '@/features/mentorship/utils/format-availability';
import type { MentorAvailabilityRule, MentorshipSession } from '@/types/domain/mentorship';

export type BookingSlot = {
  id: string;
  ruleId: string;
  date: Date;
  dayLabel: string;
  dateLabel: string;
  timeLabel: string;
  timezone: string;
  status: 'available' | 'booked';
  rule: MentorAvailabilityRule;
};

function slotOverlapsSession(
  start: Date,
  end: Date,
  sessions: MentorshipSession[],
): boolean {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return sessions.some((s) => {
    if (s.status === 'cancelled') return false;
    const sStart = new Date(s.scheduledStart).getTime();
    const sEnd = new Date(s.scheduledEnd).getTime();
    return startMs < sEnd && endMs > sStart;
  });
}

function occurrenceForWeekOffset(
  rule: MentorAvailabilityRule,
  weekOffset: number,
): { start: Date; end: Date } {
  const now = new Date();
  const currentDow = now.getDay();
  let daysAhead = rule.dayOfWeek - currentDow + weekOffset * 7;
  if (daysAhead < 0) daysAhead += 7;
  if (weekOffset === 0 && daysAhead === 0) {
    const [startH, startMins] = rule.startTime.split(':').map(Number);
    const slotEndToday = new Date(now);
    slotEndToday.setHours(startH, startMins ?? 0, 0, 0);
    if (slotEndToday.getTime() <= now.getTime()) daysAhead += 7;
  }

  const [startH, startM] = rule.startTime.split(':').map(Number);
  const [endH, endM] = rule.endTime.split(':').map(Number);

  const start = new Date(now);
  start.setDate(now.getDate() + daysAhead);
  start.setHours(startH, startM ?? 0, 0, 0);

  const end = new Date(start);
  end.setHours(endH, endM ?? 0, 0, 0);
  if (end <= start) end.setHours(end.getHours() + 1);

  return { start, end };
}

/** Build upcoming bookable slots from weekly rules, marking conflicts with existing sessions. */
export function buildBookingSlots(
  rules: MentorAvailabilityRule[],
  sessions: MentorshipSession[],
  weeksAhead = 4,
): BookingSlot[] {
  const activeRules = rules.filter((r) => r.isActive);
  const slots: BookingSlot[] = [];

  for (const rule of activeRules) {
    for (let w = 0; w < weeksAhead; w++) {
      const { start, end } = occurrenceForWeekOffset(rule, w);
      const booked = slotOverlapsSession(start, end, sessions);
      const dateLabel = start.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

      slots.push({
        id: `${rule.id}-${start.toISOString().slice(0, 10)}`,
        ruleId: rule.id,
        date: start,
        dayLabel: formatDayOfWeek(rule.dayOfWeek),
        dateLabel,
        timeLabel: `${formatTimeLabel(rule.startTime)} – ${formatTimeLabel(rule.endTime)}`,
        timezone: rule.timezone,
        status: booked ? 'booked' : 'available',
        rule,
      });
    }
  }

  return slots.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function slotToBookingPayload(
  slot: BookingSlot,
  mentorshipId: string,
  userId: string,
) {
  const [endH, endM] = slot.rule.endTime.split(':').map(Number);
  const end = new Date(slot.date);
  end.setHours(endH, endM ?? 0, 0, 0);
  if (end <= slot.date) end.setHours(end.getHours() + 1);

  return {
    mentorshipId,
    createdBy: userId,
    scheduledStart: slot.date.toISOString(),
    scheduledEnd: end.toISOString(),
    timezone: slot.timezone,
    title: 'Mentorship session',
  };
}
