const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function formatDayOfWeek(day: number): string {
  return DAY_NAMES[day] ?? `Day ${day}`;
}

export function formatTimeLabel(time: string): string {
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h)) return time;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  const mins = m ? `:${String(m).padStart(2, '0')}` : '';
  return `${hour12}${mins} ${period}`;
}

export function formatAvailabilityRule(
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  timezone: string,
): string {
  return `${formatDayOfWeek(dayOfWeek)} · ${formatTimeLabel(startTime)} – ${formatTimeLabel(endTime)} (${timezone})`;
}
