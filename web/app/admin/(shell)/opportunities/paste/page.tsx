import { getTranslations } from 'next-intl/server';

import { OPPORTUNITY_CATEGORIES, OPPORTUNITY_TAGS } from '@/lib/opportunity-options';
import { PasteOpportunitiesForm } from './PasteOpportunitiesForm';

const FIELD_REFERENCE: { label: string; values: readonly string[]; note?: string }[] = [
  { label: 'category', values: OPPORTUNITY_CATEGORIES },
  { label: 'tags', values: OPPORTUNITY_TAGS },
  {
    label: 'fundingType',
    values: ['fully_funded', 'partially_funded', 'self_funded'],
    note: 'Defaults to fully_funded if omitted.',
  },
  {
    label: 'degreeLevels',
    values: ['high_school', 'bachelors', 'masters', 'phd', 'professional'],
    note: 'Array of one or more values.',
  },
  {
    label: 'locationType',
    values: ['remote', 'onsite', 'hybrid'],
    note: 'Common synonyms (e.g. "virtual", "on-site") are normalized automatically.',
  },
  {
    label: 'country',
    values: ['Ghana', 'South Africa', 'Nigeria', 'United States', 'United Kingdom', 'Global', '...'],
    note: 'Defaults to "Global" if omitted.',
  },
];

export default async function AdminOpportunitiesPastePage() {
  const t = await getTranslations('Admin.opportunities.paste');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary mb-1">{t('title')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('subtitle')}</p>

      <details className="mb-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">{t('fieldReference')}</summary>
        <div className="px-4 pb-4 space-y-3">
          {FIELD_REFERENCE.map((field) => (
            <div key={field.label}>
              <p className="text-xs font-bold text-primary">{field.label}</p>
              <p className="text-xs text-[var(--color-muted)] font-mono">{field.values.join(' | ')}</p>
              {field.note && <p className="text-xs italic text-[var(--color-muted)]">{field.note}</p>}
            </div>
          ))}
        </div>
      </details>

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4">
        <PasteOpportunitiesForm />
      </section>
    </div>
  );
}
