import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { requireAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { formatFundingTypeChart, mapAdminAnalytics } from '@/lib/admin-analytics';
import { BarList } from '../BarList';
import { StatTile } from '../StatTile';

export default async function AdminDashboardPage() {
  const [session, t] = await Promise.all([requireAdminSession(), getTranslations('Admin.dashboard')]);
  const client = createUserClient(session.accessToken);

  const { data } = await client.rpc('get_admin_analytics');
  const analytics = mapAdminAnalytics(data);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-primary">{t('title')}</h1>
          <p className="text-sm text-[var(--color-muted)]">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/opportunities/pending"
            className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-background)] transition"
          >
            {t('reviewPending')}
          </Link>
          <Link
            href="/admin/opportunities/create"
            className="rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition"
          >
            {t('createNew')}
          </Link>
        </div>
      </div>

      {!analytics ? (
        <p className="text-sm text-[var(--color-muted)]">{t('failedToLoad')}</p>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">
              {t('sections.users')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatTile label={t('stats.totalUsers')} value={analytics.users.total} />
              <StatTile label={t('stats.newThisWeek')} value={analytics.users.newThisWeek} />
              <StatTile label={t('stats.newThisMonth')} value={analytics.users.newThisMonth} />
              <StatTile label={t('stats.onboardingDone')} value={analytics.users.onboardingComplete} />
              <StatTile label={t('stats.onboardingPending')} value={analytics.users.onboardingIncomplete} />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">
              {t('sections.opportunities')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatTile label={t('stats.totalPosted')} value={analytics.opportunities.total} />
              <StatTile label={t('stats.closingIn7Days')} value={analytics.opportunities.closingIn7Days} />
            </div>
            <div className="grid md:grid-cols-3 gap-3 mt-3">
              <BarList title={t('charts.byCategory')} items={analytics.opportunities.byCategory} emptyLabel={t('charts.noData')} />
              <BarList title={t('charts.byCountry')} items={analytics.opportunities.byCountry} emptyLabel={t('charts.noData')} />
              <BarList
                title={t('charts.byFundingType')}
                items={formatFundingTypeChart(analytics.opportunities.byFundingType)}
                emptyLabel={t('charts.noData')}
              />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">
              {t('sections.engagement')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatTile label={t('stats.totalSaves')} value={analytics.engagement.totalSaves} />
              <StatTile label={t('stats.totalApplied')} value={analytics.engagement.totalApplied} />
            </div>
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <BarList
                title={t('topLists.mostSaved')}
                items={analytics.engagement.topSaved.map((row) => ({ label: row.title, value: row.count }))}
                emptyLabel={t('topLists.noData')}
              />
              <BarList
                title={t('topLists.mostApplied')}
                items={analytics.engagement.topApplied.map((row) => ({ label: row.title, value: row.count }))}
                emptyLabel={t('topLists.noData')}
              />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">
              {t('sections.notifications')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatTile label={t('stats.totalSent')} value={analytics.notifications.totalSent} />
              <StatTile label={t('stats.totalUnread')} value={analytics.notifications.totalUnread} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
