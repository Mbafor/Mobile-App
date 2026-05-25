export function formatSessionDateTime(iso: string, timezone?: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone && timezone !== 'UTC' ? timezone : undefined,
  });
}

export function isSessionUpcoming(session: { status: string; scheduledEnd: string }): boolean {
  if (session.status === 'cancelled' || session.status === 'completed') return false;
  return new Date(session.scheduledEnd).getTime() > Date.now();
}
