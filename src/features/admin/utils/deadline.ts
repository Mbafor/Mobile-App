/** Converts YYYY-MM-DD (form input) to ISO timestamptz for Supabase. */
export function parseDeadlineToIso(dateInput: string): string {
  const trimmed = dateInput.trim();
  if (!trimmed) {
    throw new Error('Deadline is required');
  }

  if (trimmed.includes('T')) {
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error('Invalid deadline');
    }
    return parsed.toISOString();
  }

  const parsed = new Date(`${trimmed}T23:59:59.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid deadline — use YYYY-MM-DD');
  }
  return parsed.toISOString();
}
