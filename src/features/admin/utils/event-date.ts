import i18n from '@/i18n';

/**
 * Converts a form date/time string to an ISO timestamptz for Supabase.
 * Accepts "YYYY-MM-DD" (defaults to 09:00 UTC) or "YYYY-MM-DDTHH:mm" —
 * mirrors admin/utils/deadline.ts's parseDeadlineToIso pattern.
 */
export function parseEventDateToIso(dateInput: string): string {
  const trimmed = dateInput.trim();
  if (!trimmed) {
    throw new Error(i18n.t('events.admin.form.validation.eventDateRequired'));
  }

  if (trimmed.includes('T')) {
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(i18n.t('events.admin.form.validation.invalidEventDate'));
    }
    return parsed.toISOString();
  }

  const parsed = new Date(`${trimmed}T09:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(i18n.t('events.admin.form.validation.invalidEventDate'));
  }
  return parsed.toISOString();
}
