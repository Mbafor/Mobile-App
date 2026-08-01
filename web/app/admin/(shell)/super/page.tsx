import { getTranslations } from 'next-intl/server';

import { requireSuperAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { mapSuperAdminOverview } from '@/lib/super-admin';
import { StatTile } from '../../StatTile';

export default async function SuperAdminOverviewPage() {
  const [session, t] = await Promise.all([requireSuperAdminSession(), getTranslations('Admin.superAdmin.overview')]);
  const client = createUserClient(session.accessToken);

  const { data } = await client.rpc('get_super_admin_overview');
  const overview = mapSuperAdminOverview(data);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary mb-1">{t('title')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('subtitle')}</p>

      {!overview ? (
        <p className="text-sm text-[var(--color-muted)]">{t('failedToLoad')}</p>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">
              {t('sections.mentorship')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile label={t('stats.approvedMentors')} value={overview.mentors.approved} />
              <StatTile label={t('stats.pendingMentors')} value={overview.mentors.pending} />
              <StatTile label={t('stats.activeMentorships')} value={overview.mentorships.active} />
              <StatTile label={t('stats.waitingList')} value={overview.waitingList} />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">
              {t('sections.platform')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile label={t('stats.totalUsers')} value={overview.users} />
              <StatTile label={t('stats.opportunityAdmins')} value={overview.admins} />
              <StatTile label={t('stats.activeOpportunities')} value={overview.opportunities.active} />
              <StatTile label={t('stats.pendingPush')} value={overview.notifications.pendingPush} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
