import i18n from '@/i18n';

/** Converts YYYY-MM-DD (form input) to ISO timestamptz for Supabase. */
export function parseDeadlineToIso(dateInput: string): string {
  const trimmed = dateInput.trim();
  if (!trimmed) {
    throw new Error(i18n.t('admin.form.validation.deadlineRequired'));
  }

  if (trimmed.includes('T')) {
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(i18n.t('admin.form.validation.invalidDeadlineGeneric'));
    }
    return parsed.toISOString();
  }

  const parsed = new Date(`${trimmed}T23:59:59.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(i18n.t('admin.form.validation.invalidDeadline'));
  }
  return parsed.toISOString();
}
