export function formatDeadline(iso: string | null | undefined): string {
  if (!iso) return 'No deadline';
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function daysUntilDeadline(iso: string | null | undefined): number {
  if (!iso) return Infinity;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/** Whole calendar days from start of today (local) to start of deadline day. */
export function calendarDaysUntilDeadline(iso: string | null | undefined): number {
  if (!iso) return Infinity;
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = startOfDay(new Date());
  const deadline = startOfDay(new Date(iso));
  return Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
