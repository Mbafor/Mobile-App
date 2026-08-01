import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { requireAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { ManageOpportunitiesList, type ManagedOpportunityListItem } from './ManageOpportunitiesList';

interface ApprovedOpportunityRow {
  id: string;
  title: string;
  organization: string;
  image_url: string | null;
  deadline: string | null;
}

export default async function AdminOpportunitiesListPage() {
  const [session, t] = await Promise.all([requireAdminSession(), getTranslations('Admin.opportunities.list')]);
  const client = createUserClient(session.accessToken);

  const [{ data }, { count: pendingCount }] = await Promise.all([
    client
      .from('opportunities')
      .select('id, title, organization, image_url, deadline')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(200)
      .returns<ApprovedOpportunityRow[]>(),
    client.from('opportunities').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  const opportunities: ManagedOpportunityListItem[] = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    organization: row.organization,
    imageUrl: row.image_url,
    deadline: row.deadline,
  }));

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-primary">{t('title')}</h1>
          <p className="text-sm text-[var(--color-muted)]">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/digest"
            className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-background)] transition"
          >
            {t('weeklyDigest')}
          </Link>
          <Link
            href="/admin/opportunities/paste"
            className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-background)] transition"
          >
            {t('pasteJson')}
          </Link>
          <Link
            href="/admin/opportunities/create"
            className="shrink-0 rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition"
          >
            {t('createNew')}
          </Link>
        </div>
      </div>

      {pendingCount != null && pendingCount > 0 && (
        <Link
          href="/admin/opportunities/pending"
          className="mb-6 flex items-center justify-between gap-3 rounded-lg bg-primary/10 px-4 py-3 text-sm hover:bg-primary/15 transition"
        >
          <span className="font-medium text-primary">{t('pendingBanner', { count: pendingCount })}</span>
          <span className="font-semibold text-primary">{t('reviewLink')}</span>
        </Link>
      )}

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <ManageOpportunitiesList opportunities={opportunities} />
      </section>
    </div>
  );
}
