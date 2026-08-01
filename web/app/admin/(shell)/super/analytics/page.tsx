import { getTranslations } from 'next-intl/server';

import { requireSuperAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { formatFundingTypeChart, mapAdminAnalytics } from '@/lib/admin-analytics';
import { BarList } from '../../../BarList';
import { StatTile } from '../../../StatTile';

export default async function SuperAdminAnalyticsPage() {
  const [session, t, tStats] = await Promise.all([
    requireSuperAdminSession(),
    getTranslations('Admin.superAdmin.analytics'),
    getTranslations('Admin.dashboard'),
  ]);
  const client = createUserClient(session.accessToken);

  const { data } = await client.rpc('get_super_admin_opportunities_analytics');
  const analytics = mapAdminAnalytics(data);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary mb-1">{t('title')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('subtitle')}</p>

      {!analytics ? (
        <p className="text-sm text-[var(--color-muted)]">{t('failedToLoad')}</p>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">
              {tStats('sections.users')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatTile label={tStats('stats.totalUsers')} value={analytics.users.total} />
              <StatTile label={tStats('stats.newThisWeek')} value={analytics.users.newThisWeek} />
              <StatTile label={tStats('stats.newThisMonth')} value={analytics.users.newThisMonth} />
              <StatTile label={tStats('stats.onboardingDone')} value={analytics.users.onboardingComplete} />
              <StatTile label={tStats('stats.onboardingPending')} value={analytics.users.onboardingIncomplete} />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">
              {tStats('sections.opportunities')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatTile label={tStats('stats.totalPosted')} value={analytics.opportunities.total} />
              <StatTile label={tStats('stats.closingIn7Days')} value={analytics.opportunities.closingIn7Days} />
            </div>
            <div className="grid md:grid-cols-3 gap-3 mt-3">
              <BarList title={tStats('charts.byCategory')} items={analytics.opportunities.byCategory} emptyLabel={tStats('charts.noData')} />
              <BarList title={tStats('charts.byCountry')} items={analytics.opportunities.byCountry} emptyLabel={tStats('charts.noData')} />
              <BarList
                title={tStats('charts.byFundingType')}
                items={formatFundingTypeChart(analytics.opportunities.byFundingType)}
                emptyLabel={tStats('charts.noData')}
              />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">
              {tStats('sections.engagement')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatTile label={tStats('stats.totalSaves')} value={analytics.engagement.totalSaves} />
              <StatTile label={tStats('stats.totalApplied')} value={analytics.engagement.totalApplied} />
            </div>
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <BarList
                title={tStats('topLists.mostSaved')}
                items={analytics.engagement.topSaved.map((row) => ({ label: row.title, value: row.count }))}
                emptyLabel={tStats('topLists.noData')}
              />
              <BarList
                title={tStats('topLists.mostApplied')}
                items={analytics.engagement.topApplied.map((row) => ({ label: row.title, value: row.count }))}
                emptyLabel={tStats('topLists.noData')}
              />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">
              {tStats('sections.notifications')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatTile label={tStats('stats.totalSent')} value={analytics.notifications.totalSent} />
              <StatTile label={tStats('stats.totalUnread')} value={analytics.notifications.totalUnread} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
