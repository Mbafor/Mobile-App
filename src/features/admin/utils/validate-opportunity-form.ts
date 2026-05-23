import { parseDeadlineToIso } from '@/features/admin/utils/deadline';
import type { OpportunityFormValues } from '@/features/admin/types/opportunity-form';

export type OpportunityFormValidation =
  | { ok: true; values: OpportunityFormValues; deadlineIso: string }
  | { ok: false; message: string };

export function validateOpportunityForm(
  values: OpportunityFormValues,
): OpportunityFormValidation {
  if (!values.title.trim() || !values.organization.trim() || !values.deadline.trim()) {
    return { ok: false, message: 'Title, organization, and deadline are required.' };
  }

  if (!values.category.trim()) {
    return { ok: false, message: 'Select an opportunity category.' };
  }

  if (!values.country.trim()) {
    return { ok: false, message: 'Select a country.' };
  }

  if (values.tags.length === 0) {
    return {
      ok: false,
      message:
        'Select at least one interest tag (open Interest tags, choose options, then tap Apply).',
    };
  }

  if (values.degreeLevels.length === 0) {
    return { ok: false, message: 'Select at least one education level.' };
  }

  if (!values.locationType) {
    return { ok: false, message: 'Select a location type (remote, on-site, or hybrid).' };
  }

  if (!values.fundingType || values.fundingType === 'any') {
    return { ok: false, message: 'Select a funding type for this listing.' };
  }

  let deadlineIso: string;
  try {
    deadlineIso = parseDeadlineToIso(values.deadline);
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : 'Invalid deadline — use YYYY-MM-DD',
    };
  }

  const deadlineMs = new Date(deadlineIso).getTime();
  if (deadlineMs <= Date.now()) {
    return {
      ok: false,
      message: 'Deadline must be in the future so students can see this listing.',
    };
  }

  return { ok: true, values, deadlineIso };
}
