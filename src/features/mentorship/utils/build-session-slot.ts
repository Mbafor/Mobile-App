/** Build ISO start/end for next occurrence of a weekly availability rule. */
export function buildNextSessionSlot(
  dayOfWeek: number,
  startTime: string,
  endTime: string,
): { scheduledStart: string; scheduledEnd: string } {
  const now = new Date();
  const currentDow = now.getDay();
  let daysAhead = dayOfWeek - currentDow;
  if (daysAhead <= 0) daysAhead += 7;

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const start = new Date(now);
  start.setDate(now.getDate() + daysAhead);
  start.setHours(startH, startM ?? 0, 0, 0);

  const end = new Date(start);
  end.setHours(endH, endM ?? 0, 0, 0);
  if (end <= start) end.setHours(end.getHours() + 1);

  return {
    scheduledStart: start.toISOString(),
    scheduledEnd: end.toISOString(),
  };
}
