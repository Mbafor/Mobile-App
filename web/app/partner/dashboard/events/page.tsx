import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { requirePartnerSession } from '@/lib/partner-session';
import { createPartnerClient } from '@/lib/supabase-server';
import { ManageEventsList } from './ManageEventsList';

export default async function PartnerEventsPage() {
  const [session, t] = await Promise.all([requirePartnerSession(), getTranslations('Partner.events.manage')]);
  const client = createPartnerClient(session.accessToken);

  const { data } = await client
    .from('events')
    .select('id, title, event_date, location_type')
    .eq('owner_type', 'partner')
    .eq('owner_id', session.partner.id)
    .order('event_date', { ascending: false });

  const events = data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-forest)]">{t('title')}</h1>
          <p className="text-sm text-[var(--color-muted)]">{t('subtitle')}</p>
        </div>
        <Link
          href="/partner/dashboard/events/create"
          className="shrink-0 rounded-md bg-[var(--color-forest)] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition"
        >
          {t('createNew')}
        </Link>
      </div>

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4">
        <ManageEventsList events={events} />
      </section>
    </div>
  );
}
