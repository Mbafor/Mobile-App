import { parseEventDateToIso } from '@/features/admin/utils/event-date';
import type { EventFormValues } from '@/features/admin/types/event-form';
import i18n from '@/i18n';

export type EventFormValidation =
  | { ok: true; values: EventFormValues; eventDateIso: string }
  | { ok: false; message: string };

function looksLikeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateEventForm(values: EventFormValues): EventFormValidation {
  if (!values.title.trim() || !values.description.trim()) {
    return { ok: false, message: i18n.t('events.admin.form.validation.requiredFields') };
  }

  if (!values.eventDate.trim()) {
    return { ok: false, message: i18n.t('events.admin.form.validation.eventDateRequired') };
  }

  if (!values.registerLink.trim() || !looksLikeUrl(values.registerLink.trim())) {
    return { ok: false, message: i18n.t('events.admin.form.validation.registerLink') };
  }

  if (values.locationType === 'in_person' && !values.locationOrLink.trim()) {
    return { ok: false, message: i18n.t('events.admin.form.validation.locationOrLink') };
  }

  let eventDateIso: string;
  try {
    eventDateIso = parseEventDateToIso(values.eventDate);
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : i18n.t('events.admin.form.validation.invalidEventDate'),
    };
  }

  return { ok: true, values, eventDateIso };
}
