'use client';

import { useState, useTransition } from 'react';

import {
  DEGREE_LEVELS,
  FUNDING_TYPES,
  LOCATION_TYPES,
  OPPORTUNITY_CATEGORIES,
  OPPORTUNITY_COUNTRIES,
  OPPORTUNITY_TAGS,
} from '@/lib/opportunity-options';
import { createPartnerOpportunity } from './actions';
import { MultiSelectDropdown } from './MultiSelectDropdown';

const inputClass =
  'w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]';

const TAG_OPTIONS = OPPORTUNITY_TAGS.map((tag) => ({ value: tag, label: tag }));

export function CreateOpportunityForm() {
  const [formKey, setFormKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await createPartnerOpportunity(formData);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSuccess(true);
      // Remount the form (and its dropdowns' internal state) instead of formRef.reset(),
      // since the tag/degree-level checkboxes are React-controlled and a native
      // .reset() would desync their checked DOM state from React state.
      setFormKey((key) => key + 1);
    });
  }

  return (
    <form key={formKey} action={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}
      {success && (
        <p className="text-sm text-[var(--color-forest)] bg-[var(--color-forest)]/10 border border-[var(--color-forest)]/30 rounded-md px-3 py-2">
          Published — visible to students now and live on your partner page.
        </p>
      )}

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="title">
          Title
        </label>
        <input id="title" name="title" required className={inputClass} placeholder="e.g. Software Engineering Internship" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="organization">
          Organization
        </label>
        <input id="organization" name="organization" required className={inputClass} placeholder="e.g. Voila Africa" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="description">
          Description
        </label>
        <textarea id="description" name="description" rows={4} className={inputClass} placeholder="What is this opportunity about?" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="imageUrl">
          Image URL
        </label>
        <input id="imageUrl" name="imageUrl" className={inputClass} placeholder="https://..." autoCapitalize="none" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="deadline">
          Deadline
        </label>
        <input id="deadline" name="deadline" type="date" required className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="applyUrl">
          Apply URL
        </label>
        <input id="applyUrl" name="applyUrl" className={inputClass} placeholder="https://..." autoCapitalize="none" />
      </div>

      <p className="text-sm font-semibold pt-2">Classification</p>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="category">
          Category
        </label>
        <select id="category" name="category" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select a category
          </option>
          {OPPORTUNITY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags</label>
        <MultiSelectDropdown name="tags" options={TAG_OPTIONS} placeholder="Select tags" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="country">
          Country
        </label>
        <select id="country" name="country" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select a country
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
          Funding type
        </label>
        <select id="fundingType" name="fundingType" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select a funding type
          </option>
          {FUNDING_TYPES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Degree levels</label>
        <MultiSelectDropdown name="degreeLevels" options={DEGREE_LEVELS} placeholder="Select degree levels" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="locationType">
          Location type
        </label>
        <select id="locationType" name="locationType" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select a location type
          </option>
          {LOCATION_TYPES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-[var(--color-forest)] text-white py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
      >
        {isPending ? 'Publishing...' : 'Publish opportunity'}
      </button>
    </form>
  );
}
