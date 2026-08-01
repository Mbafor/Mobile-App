import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { requireAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { PendingQueueList, type PendingOpportunityListItem } from './PendingQueueList';

interface PendingOpportunityRow {
  id: string;
  title: string;
  organization: string;
  category: string | null;
  country: string | null;
  source: string | null;
  deadline: string | null;
}

export default async function AdminOpportunitiesQueuePage() {
  const [session, t] = await Promise.all([requireAdminSession(), getTranslations('Admin.opportunities.queue')]);
  const client = createUserClient(session.accessToken);

  const { data } = await client
    .from('opportunities')
    .select('id, title, organization, category, country, source, deadline')
    .eq('status', 'pending')
    .order('scraped_at', { ascending: true })
    .limit(200)
    .returns<PendingOpportunityRow[]>();

  const pending: PendingOpportunityListItem[] = data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-primary">{t('title')}</h1>
          <p className="text-sm text-[var(--color-muted)]">{t('subtitle')}</p>
        </div>
        <Link
          href="/admin/opportunities/create"
          className="shrink-0 rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition"
        >
          {t('createNew')}
        </Link>
      </div>

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <PendingQueueList opportunities={pending} />
      </section>
    </div>
  );
}
