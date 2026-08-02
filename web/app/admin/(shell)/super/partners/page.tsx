import { getTranslations } from 'next-intl/server';

import { requireSuperAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { mapPartnerAnalytics, parsePaginated, type SuperAdminPartnerRow } from '@/lib/super-admin';
import { BarList } from '../../../BarList';
import { StatTile } from '../../../StatTile';
import { SearchBox } from '../_shared/SearchBox';
import { Pagination } from '../_shared/Pagination';
import { AddPartnerForm } from './AddPartnerForm';
import { PartnersTable } from './PartnersTable';

const PAGE_SIZE = 15;

export default async function SuperAdminPartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search, page: pageParam } = await searchParams;
  const page = Math.max(0, Number(pageParam) || 0);

  const [session, t, tPagination] = await Promise.all([
    requireSuperAdminSession(),
    getTranslations('Admin.superAdmin.partners'),
    getTranslations('Admin.superAdmin.pagination'),
  ]);
  const client = createUserClient(session.accessToken);

  const [{ data: partnersData }, { data: analyticsData }] = await Promise.all([
    client.rpc('get_super_admin_partners', {
      p_search: search?.trim() || null,
      p_limit: PAGE_SIZE,
      p_offset: page * PAGE_SIZE,
    }),
    client.rpc('get_super_admin_partner_analytics'),
  ]);
  const { items, total } = parsePaginated<SuperAdminPartnerRow>(partnersData);
  const analytics = mapPartnerAnalytics(analyticsData);

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();
    if (search?.trim()) params.set('search', search.trim());
    if (nextPage > 0) params.set('page', String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/super/partners?${qs}` : '/admin/super/partners';
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary mb-1">{t('pageTitle')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('intro')}</p>

      {analytics && (
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile label={t('stats.total')} value={analytics.total} />
            <StatTile label={t('stats.active')} value={analytics.active} />
            <StatTile label={t('stats.opportunitiesPosted')} value={analytics.totalOpportunitiesPosted} />
            <StatTile label={t('stats.linkClicks')} value={analytics.totalLinkClicks} />
          </div>
          <div className="mt-3">
            <BarList title={t('stats.topByPosts')} items={analytics.byPartner} emptyLabel={t('stats.noData')} />
          </div>
        </div>
      )}

      <AddPartnerForm />
      <SearchBox placeholder={t('searchPlaceholder')} />
      <PartnersTable rows={items} />
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} buildHref={buildHref} t={tPagination} />
    </div>
  );
}
