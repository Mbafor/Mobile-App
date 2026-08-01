'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import {
  DEGREE_LEVELS,
  FUNDING_TYPES,
  LOCATION_TYPES,
  OPPORTUNITY_CATEGORIES,
  OPPORTUNITY_COUNTRIES,
  OPPORTUNITY_TAGS,
} from '@/lib/opportunity-options';
import { MultiSelectDropdown } from './MultiSelectDropdown';

const inputClass =
  'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]';

const TAG_OPTIONS = OPPORTUNITY_TAGS.map((tag) => ({ value: tag, label: tag }));

export type OpportunityFormResult = { ok: true } | { ok: false; message: string };

export interface OpportunityFormValues {
  title: string;
  organization: string;
  description: string;
  benefits: string;
  imageUrl: string;
  deadline: string;
  applyUrl: string;
  category: string;
  tags: string[];
  country: string;
  fundingType: string;
  degreeLevels: string[];
  locationType: string;
}

/** Shared between the Partner dashboard and the Admin opportunities section
 * (web/app/admin/opportunities) -- both surfaces manage the same opportunity
 * fields, same precedent as EventForm (web/app/events/_shared/EventForm.tsx)
 * being shared between admin and partner events. */
export function OpportunityForm({
  action,
  initialValues,
  submitLabel,
  pendingLabel,
  successMessage,
  resetOnSuccess = false,
  secondaryAction,
}: {
  action: (formData: FormData) => Promise<OpportunityFormResult>;
  initialValues?: Partial<OpportunityFormValues>;
  submitLabel: string;
  pendingLabel: string;
  successMessage: string;
  resetOnSuccess?: boolean;
  secondaryAction?: { label: string; pendingLabel: string; onClick: () => void; destructive?: boolean; disabled?: boolean };
}) {
  const t = useTranslations('Opportunities.form');
  const [formKey, setFormKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      // Remount the form (and its dropdowns' internal state) instead of formRef.reset(),
      // since the tag/degree-level checkboxes are React-controlled and a native
      // .reset() would desync their checked DOM state from React state.
      if (resetOnSuccess) setFormKey((key) => key + 1);
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
        <label className="block text-sm font-medium mb-1" htmlFor="organization">
          {t('organization')}
        </label>
        <input
          id="organization"
          name="organization"
          required
          defaultValue={initialValues?.organization}
          className={inputClass}
          placeholder={t('organizationPlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="description">
          {t('description')}
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initialValues?.description}
          className={inputClass}
          placeholder={t('descriptionPlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="benefits">
          {t('benefits')}
        </label>
        <textarea
          id="benefits"
          name="benefits"
          rows={4}
          defaultValue={initialValues?.benefits}
          className={inputClass}
          placeholder={t('benefitsPlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="imageUrl">
          {t('imageUrl')}
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          defaultValue={initialValues?.imageUrl}
          className={inputClass}
          placeholder="https://..."
          autoCapitalize="none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="deadline">
          {t('deadline')}
        </label>
        <input
          id="deadline"
          name="deadline"
          type="date"
          required
          defaultValue={initialValues?.deadline}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="applyUrl">
          {t('applyUrl')}
        </label>
        <input
          id="applyUrl"
          name="applyUrl"
          defaultValue={initialValues?.applyUrl}
          className={inputClass}
          placeholder="https://..."
          autoCapitalize="none"
        />
      </div>

      <p className="text-sm font-semibold pt-2">{t('classification')}</p>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="category">
          {t('category')}
        </label>
        <select id="category" name="category" required defaultValue={initialValues?.category ?? ''} className={inputClass}>
          <option value="" disabled>
            {t('selectCategory')}
          </option>
          {OPPORTUNITY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('tags')}</label>
        <MultiSelectDropdown name="tags" options={TAG_OPTIONS} placeholder={t('selectTags')} defaultSelected={initialValues?.tags} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="country">
          {t('country')}
        </label>
        <select id="country" name="country" required defaultValue={initialValues?.country ?? ''} className={inputClass}>
          <option value="" disabled>
            {t('selectCountry')}
          </option>
          {OPPORTUNITY_COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="fundingType">
          {t('fundingType')}
        </label>
        <select id="fundingType" name="fundingType" required defaultValue={initialValues?.fundingType ?? ''} className={inputClass}>
          <option value="" disabled>
            {t('selectFundingType')}
          </option>
          {FUNDING_TYPES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('degreeLevels')}</label>
        <MultiSelectDropdown
          name="degreeLevels"
          options={DEGREE_LEVELS}
          placeholder={t('selectDegreeLevels')}
          defaultSelected={initialValues?.degreeLevels}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="locationType">
          {t('locationType')}
        </label>
        <select id="locationType" name="locationType" required defaultValue={initialValues?.locationType ?? ''} className={inputClass}>
          <option value="" disabled>
            {t('selectLocationType')}
          </option>
          {LOCATION_TYPES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-md bg-[var(--color-forest)] text-white py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            disabled={isPending || secondaryAction.disabled}
            className={`rounded-md border py-2 px-4 text-sm font-medium disabled:opacity-50 transition ${
              secondaryAction.destructive
                ? 'border-red-300 text-red-600 hover:bg-red-50'
                : 'border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface)]'
            }`}
          >
            {secondaryAction.disabled ? secondaryAction.pendingLabel : secondaryAction.label}
          </button>
        )}
      </div>
    </form>
  );
}
