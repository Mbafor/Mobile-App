import { parseDeadlineToIso } from '@/features/admin/utils/deadline';
import type { OpportunityFormValues } from '@/features/admin/types/opportunity-form';
import i18n from '@/i18n';

export type OpportunityFormValidation =
  | { ok: true; values: OpportunityFormValues; deadlineIso: string }
  | { ok: false; message: string };

export function validateOpportunityForm(
  values: OpportunityFormValues,
): OpportunityFormValidation {
  if (!values.title.trim() || !values.organization.trim() || !values.deadline.trim()) {
    return { ok: false, message: i18n.t('admin.form.validation.requiredFields') };
  }

  if (!values.category.trim()) {
    return { ok: false, message: i18n.t('admin.form.validation.category') };
  }

  if (!values.country.trim()) {
    return { ok: false, message: i18n.t('admin.form.validation.country') };
  }

  if (values.tags.length === 0) {
    return {
      ok: false,
      message: i18n.t('admin.form.validation.tags'),
    };
  }

  if (values.degreeLevels.length === 0) {
    return { ok: false, message: i18n.t('admin.form.validation.degreeLevels') };
  }

  if (!values.locationType) {
    return { ok: false, message: i18n.t('admin.form.validation.locationType') };
  }

  if (!values.fundingType || values.fundingType === 'any') {
    return { ok: false, message: i18n.t('admin.form.validation.fundingType') };
  }

  let deadlineIso: string;
  try {
    deadlineIso = parseDeadlineToIso(values.deadline);
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : i18n.t('admin.form.validation.invalidDeadline'),
    };
  }

  const deadlineMs = new Date(deadlineIso).getTime();
  if (deadlineMs <= Date.now()) {
    return {
      ok: false,
      message: i18n.t('admin.form.validation.deadlineInFuture'),
    };
  }

  return { ok: true, values, deadlineIso };
}
