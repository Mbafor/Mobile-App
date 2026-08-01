import { getTranslations } from 'next-intl/server';

import { requireSuperAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { parsePaginated, type SuperAdminAdminRow } from '@/lib/super-admin';
import { SearchBox } from '../_shared/SearchBox';
import { Pagination } from '../_shared/Pagination';
import { AddAdminForm } from './AddAdminForm';
import { AdminsTable } from './AdminsTable';

const PAGE_SIZE = 15;

export default async function SuperAdminAdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search, page: pageParam } = await searchParams;
  const page = Math.max(0, Number(pageParam) || 0);

  const [session, t, tPagination] = await Promise.all([
    requireSuperAdminSession(),
    getTranslations('Admin.superAdmin.admins'),
    getTranslations('Admin.superAdmin.pagination'),
  ]);
  const client = createUserClient(session.accessToken);

  const { data } = await client.rpc('get_super_admin_admins', {
    p_search: search?.trim() || null,
    p_limit: PAGE_SIZE,
    p_offset: page * PAGE_SIZE,
  });
  const { items, total } = parsePaginated<SuperAdminAdminRow>(data);

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();
    if (search?.trim()) params.set('search', search.trim());
    if (nextPage > 0) params.set('page', String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/super/admins?${qs}` : '/admin/super/admins';
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary mb-1">{t('pageTitle')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('intro')}</p>

      <AddAdminForm />
      <SearchBox placeholder={t('searchPlaceholder')} />
      <AdminsTable rows={items} />
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} buildHref={buildHref} t={tPagination} />
    </div>
  );
}
