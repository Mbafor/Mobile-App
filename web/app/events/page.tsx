import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { createServiceRoleClient } from '@/lib/supabase-server';
import { EVENT_CATEGORIES } from '@/lib/opportunity-options';
import { EventCard, type EventCardData } from './EventCard';

export const metadata: Metadata = {
  title: 'Events | Voila Africa',
  description: 'Free webinars, info sessions, and career events for African students -- hosted by Voila Africa.',
};

interface EventsSearchParams {
  tab?: string;
  q?: string;
  location?: string;
  topic?: string;
}

async function getEvents(params: EventsSearchParams): Promise<EventCardData[]> {
  const tab = params.tab === 'past' ? 'past' : 'upcoming';
  const supabase = createServiceRoleClient();

  let query = supabase
    .from('events')
    .select('id, slug, title, tagline, description, event_date, end_time, timezone, location_type, image_url, category, host_name')
    .neq('status', 'cancelled')
    .not('slug', 'is', null);

  const nowIso = new Date().toISOString();
  query = tab === 'upcoming' ? query.gte('event_date', nowIso) : query.lt('event_date', nowIso);
  query = query.order('event_date', { ascending: tab === 'upcoming' });

  if (params.q?.trim()) {
    const q = params.q.trim();
    query = query.or(`title.ilike.%${q}%,tagline.ilike.%${q}%`);
  }
  if (params.location === 'virtual' || params.location === 'in_person') {
    query = query.eq('location_type', params.location);
  }
  if (params.topic) {
    query = query.eq('category', params.topic);
  }

  const { data } = await query.limit(60);
  return data ?? [];
}

function buildHref(base: EventsSearchParams, overrides: Partial<EventsSearchParams>): string {
  const merged = { ...base, ...overrides };
  const search = new URLSearchParams();
  if (merged.tab && merged.tab !== 'upcoming') search.set('tab', merged.tab);
  if (merged.q) search.set('q', merged.q);
  if (merged.location && merged.location !== 'all') search.set('location', merged.location);
  if (merged.topic) search.set('topic', merged.topic);
  const qs = search.toString();
  return qs ? `/events?${qs}` : '/events';
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<EventsSearchParams>;
}) {
  const params = await searchParams;
  const tab = params.tab === 'past' ? 'past' : 'upcoming';
  const location = params.location === 'virtual' || params.location === 'in_person' ? params.location : 'all';

  const [events, t] = await Promise.all([getEvents(params), getTranslations('Events.listing')]);

  const pillBase =
    'inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 whitespace-nowrap';
  const pillActive = 'bg-primary text-white';
  const pillInactive = 'bg-primary/5 text-primary hover:bg-primary/10 border border-primary/15';

  return (
    <main className="min-h-screen bg-[var(--color-surface)]">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">{t('title')}</h1>
          <p className="text-sm text-[var(--color-muted)] mt-2">{t('subtitle')}</p>
        </header>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="inline-flex rounded-full bg-white border border-[var(--color-border)] p-1">
            <a
              href={buildHref(params, { tab: 'upcoming' })}
              className={`${pillBase} ${tab === 'upcoming' ? pillActive : 'text-[#1A1A1A]'}`}
            >
              {t('upcoming')}
            </a>
            <a
              href={buildHref(params, { tab: 'past' })}
              className={`${pillBase} ${tab === 'past' ? pillActive : 'text-[#1A1A1A]'}`}
            >
              {t('past')}
            </a>
          </div>

          <form action="/events" method="GET" className="flex-1 min-w-[200px] max-w-sm">
            {tab !== 'upcoming' && <input type="hidden" name="tab" value={tab} />}
            {location !== 'all' && <input type="hidden" name="location" value={location} />}
            {params.topic && <input type="hidden" name="topic" value={params.topic} />}
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ''}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </form>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <a href={buildHref(params, { location: 'all' })} className={`${pillBase} ${location === 'all' ? pillActive : pillInactive}`}>
            {t('all')}
          </a>
          <a
            href={buildHref(params, { location: 'in_person' })}
            className={`${pillBase} ${location === 'in_person' ? pillActive : pillInactive}`}
          >
            {t('inPerson')}
          </a>
          <a
            href={buildHref(params, { location: 'virtual' })}
            className={`${pillBase} ${location === 'virtual' ? pillActive : pillInactive}`}
          >
            {t('online')}
          </a>
          <span className="w-px h-5 bg-[var(--color-border)] mx-1" />
          {EVENT_CATEGORIES.map((cat) => (
            <a
              key={cat}
              href={buildHref(params, { topic: params.topic === cat ? undefined : cat })}
              className={`${pillBase} ${params.topic === cat ? pillActive : pillInactive}`}
            >
              {cat}
            </a>
          ))}
        </div>

        {events.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] py-16 text-center">{t('empty')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
