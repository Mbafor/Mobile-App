'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const selectClass =
  'appearance-none rounded-full border border-[var(--color-border)] bg-white pl-4 pr-9 py-2 text-xs font-semibold text-[#1A1A1A] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary bg-[url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="%23666666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>\')] bg-no-repeat bg-[right_0.9rem_center]';

export interface EventFiltersProps {
  tab: string;
  q?: string;
  location: string;
  topic?: string;
  categories: readonly string[];
}

export function EventFilters({ tab, q, location, topic, categories }: EventFiltersProps) {
  const router = useRouter();
  const t = useTranslations('Events.listing');

  function navigate(overrides: { location?: string; topic?: string }) {
    const merged = { tab, q, location, topic, ...overrides };
    const search = new URLSearchParams();
    if (merged.tab && merged.tab !== 'upcoming') search.set('tab', merged.tab);
    if (merged.q) search.set('q', merged.q);
    if (merged.location && merged.location !== 'all') search.set('location', merged.location);
    if (merged.topic) search.set('topic', merged.topic);
    const qs = search.toString();
    router.push(qs ? `/events?${qs}` : '/events');
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-8">
      <select
        aria-label={t('locationFilterLabel')}
        value={location}
        onChange={(e) => navigate({ location: e.target.value })}
        className={selectClass}
      >
        <option value="all">{t('all')}</option>
        <option value="in_person">{t('inPerson')}</option>
        <option value="virtual">{t('online')}</option>
      </select>

      <select
        aria-label={t('topicFilterLabel')}
        value={topic ?? ''}
        onChange={(e) => navigate({ topic: e.target.value || undefined })}
        className={selectClass}
      >
        <option value="">{t('allTopics')}</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}
