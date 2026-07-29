'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { EVENT_CATEGORIES } from '@/lib/opportunity-options';

const inputClass =
  'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]';

export type EventFormResult = { ok: true } | { ok: false; message: string };

export interface EventFormValues {
  title: string;
  tagline: string;
  description: string;
  takeaways: string;
  hostName: string;
  hostBio: string;
  eventDate: string;
  endTime: string;
  timezone: string;
  locationType: string;
  locationPlatform: string;
  meetingLink: string;
  capacity: string;
  registerLink: string;
  category: string;
  imageUrl: string;
}

export function EventForm({
  action,
  initialValues,
  submitLabel,
  pendingLabel,
  successMessage,
  resetOnSuccess = false,
}: {
  action: (formData: FormData) => Promise<EventFormResult>;
  initialValues?: Partial<EventFormValues>;
  submitLabel: string;
  pendingLabel: string;
  successMessage: string;
  resetOnSuccess?: boolean;
}) {
  const t = useTranslations('Events.form');
  const [formKey, setFormKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [locationType, setLocationType] = useState(initialValues?.locationType || 'virtual');

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await action(formData);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSuccess(true);
      if (resetOnSuccess) {
        setFormKey((key) => key + 1);
        setLocationType('virtual');
      }
    });
  }

  return (
    <form key={formKey} action={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}
      {success && (
        <p className="text-sm text-[var(--color-forest)] bg-[var(--color-forest)]/10 border border-[var(--color-forest)]/30 rounded-md px-3 py-2">
          {successMessage}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="title">
          {t('title')}
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={initialValues?.title}
          className={inputClass}
          placeholder={t('titlePlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="tagline">
          {t('tagline')}
        </label>
        <input
          id="tagline"
          name="tagline"
          defaultValue={initialValues?.tagline}
          className={inputClass}
          placeholder={t('taglinePlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="description">
          {t('description')}
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={initialValues?.description}
          className={inputClass}
          placeholder={t('descriptionPlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="takeaways">
          {t('takeaways')}
        </label>
        <textarea
          id="takeaways"
          name="takeaways"
          rows={4}
          defaultValue={initialValues?.takeaways}
          className={inputClass}
          placeholder={t('takeawaysPlaceholder')}
        />
        <p className="text-xs text-[var(--color-muted)] mt-1">{t('takeawaysHint')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="hostName">
            {t('hostName')}
          </label>
          <input
            id="hostName"
            name="hostName"
            defaultValue={initialValues?.hostName}
            className={inputClass}
            placeholder={t('hostNamePlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="category">
            {t('category')}
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={initialValues?.category ?? ''}
            className={inputClass}
          >
            <option value="" disabled>
              {t('categoryPlaceholder')}
            </option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="hostBio">
          {t('hostBio')}
        </label>
        <textarea
          id="hostBio"
          name="hostBio"
          rows={3}
          defaultValue={initialValues?.hostBio}
          className={inputClass}
          placeholder={t('hostBioPlaceholder')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="eventDate">
            {t('eventDate')}
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="datetime-local"
            required
            defaultValue={initialValues?.eventDate}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="endTime">
            {t('endTime')}
          </label>
          <input
            id="endTime"
            name="endTime"
            type="datetime-local"
            defaultValue={initialValues?.endTime}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="timezone">
          {t('timezone')}
        </label>
        <input
          id="timezone"
          name="timezone"
          defaultValue={initialValues?.timezone || 'GMT'}
          className={inputClass}
          placeholder="GMT"
        />
      </div>

      <div>
        <span className="block text-sm font-medium mb-1">{t('locationType')}</span>
        <div className="flex gap-2">
          <label
            className={`flex-1 flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition ${
              locationType === 'virtual'
                ? 'border-[var(--color-forest)] bg-[var(--color-forest)]/10 text-[var(--color-forest)] font-medium'
                : 'border-[var(--color-border)] text-[var(--color-muted)]'
            }`}
          >
            <input
              type="radio"
              name="locationType"
              value="virtual"
              checked={locationType === 'virtual'}
              onChange={() => setLocationType('virtual')}
              className="sr-only"
            />
            {t('virtual')}
          </label>
          <label
            className={`flex-1 flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition ${
              locationType === 'in_person'
                ? 'border-[var(--color-forest)] bg-[var(--color-forest)]/10 text-[var(--color-forest)] font-medium'
                : 'border-[var(--color-border)] text-[var(--color-muted)]'
            }`}
          >
            <input
              type="radio"
              name="locationType"
              value="in_person"
              checked={locationType === 'in_person'}
              onChange={() => setLocationType('in_person')}
              className="sr-only"
            />
            {t('inPerson')}
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="locationPlatform">
          {locationType === 'virtual' ? t('platformLabel') : t('venueLabel')}
        </label>
        <input
          id="locationPlatform"
          name="locationPlatform"
          defaultValue={initialValues?.locationPlatform}
          className={inputClass}
          placeholder={locationType === 'virtual' ? t('platformPlaceholder') : t('venuePlaceholder')}
        />
      </div>

      {locationType === 'virtual' && (
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="meetingLink">
            {t('meetingLink')}
          </label>
          <input
            id="meetingLink"
            name="meetingLink"
            type="url"
            defaultValue={initialValues?.meetingLink}
            className={inputClass}
            placeholder="https://..."
            autoCapitalize="none"
          />
          <p className="text-xs text-[var(--color-muted)] mt-1">{t('meetingLinkHint')}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="capacity">
          {t('capacity')}
        </label>
        <input
          id="capacity"
          name="capacity"
          type="number"
          min={1}
          step={1}
          defaultValue={initialValues?.capacity}
          className={inputClass}
          placeholder={t('capacityPlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="registerLink">
          {t('registerLink')}
        </label>
        <input
          id="registerLink"
          name="registerLink"
          type="url"
          defaultValue={initialValues?.registerLink}
          className={inputClass}
          placeholder="https://..."
          autoCapitalize="none"
        />
        <p className="text-xs text-[var(--color-muted)] mt-1">{t('registerLinkHint')}</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="imageUrl">
          {t('image')}
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          defaultValue={initialValues?.imageUrl}
          className={inputClass}
          placeholder={t('imageUrlPlaceholder')}
          autoCapitalize="none"
        />
        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-muted)]">{t('or')}</span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>
        <input
          id="imageFile"
          name="imageFile"
          type="file"
          accept="image/*"
          className="w-full text-sm text-[var(--color-muted)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-forest)]/10 file:text-[var(--color-forest)] file:px-3 file:py-2 file:text-sm file:font-medium"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-[var(--color-forest)] text-white py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
      >
        {isPending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
