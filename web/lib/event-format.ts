/** Shared date/time formatting for event listing + single event pages.
 * event_date/end_time are timestamptz (a real instant); `timezone` is a
 * free-text label partners/admins type in (default "GMT") that we try to use
 * as an Intl IANA zone for display, falling back to UTC if it isn't one --
 * e.g. "GMT" and "UTC" resolve fine, but something like "WAT" or "GMT+1"
 * would throw, so we don't trust it blindly. */

function safeTimeZone(timezone: string): string {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return timezone;
  } catch {
    return 'UTC';
  }
}

export function formatDateBadge(startIso: string, timezone: string): { month: string; day: string } {
  const tz = safeTimeZone(timezone);
  const d = new Date(startIso);
  return {
    month: new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: tz }).format(d).toUpperCase(),
    day: new Intl.DateTimeFormat('en-US', { day: 'numeric', timeZone: tz }).format(d),
  };
}

export function formatFullDate(startIso: string, timezone: string): string {
  const tz = safeTimeZone(timezone);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: tz,
  }).format(new Date(startIso));
}

export function formatTimeRange(startIso: string, endIso: string | null, timezone: string): string {
  const tz = safeTimeZone(timezone);
  const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz });
  const start = timeFmt.format(new Date(startIso));
  if (!endIso) return `${start} ${timezone}`;
  const end = timeFmt.format(new Date(endIso));
  return `${start} – ${end} ${timezone}`;
}

export function formatShortDateTime(startIso: string, timezone: string): string {
  const tz = safeTimeZone(timezone);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: tz,
  }).format(new Date(startIso));
}

export function isUpcoming(startIso: string): boolean {
  return new Date(startIso).getTime() >= Date.now();
}

export function generateRegistrationRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'VLA-';
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
