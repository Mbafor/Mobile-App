import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { requireSuperAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { parsePaginated, type SuperAdminMentorRow } from '@/lib/super-admin';
import { SearchBox } from '../_shared/SearchBox';
import { Pagination } from '../_shared/Pagination';
import { AddMentorForm } from './AddMentorForm';
import { MentorsTable } from './MentorsTable';

const PAGE_SIZE = 15;
const STATUSES = ['pending', 'approved', 'suspended'] as const;

export default async function SuperAdminMentorsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const { search, status, page: pageParam } = await searchParams;
  const page = Math.max(0, Number(pageParam) || 0);
  const activeStatus = status && STATUSES.includes(status as (typeof STATUSES)[number]) ? status : null;

  const [session, t, tPagination] = await Promise.all([
    requireSuperAdminSession(),
    getTranslations('Admin.superAdmin.mentors'),
    getTranslations('Admin.superAdmin.pagination'),
  ]);
  const client = createUserClient(session.accessToken);

  const { data } = await client.rpc('get_super_admin_mentors', {
    p_search: search?.trim() || null,
    p_status: activeStatus,
    p_limit: PAGE_SIZE,
    p_offset: page * PAGE_SIZE,
  });
  const { items, total } = parsePaginated<SuperAdminMentorRow>(data);

  function buildHref(nextPage: number, nextStatus: string | null = activeStatus) {
    const params = new URLSearchParams();
    if (search?.trim()) params.set('search', search.trim());
    if (nextStatus) params.set('status', nextStatus);
    if (nextPage > 0) params.set('page', String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/super/mentors?${qs}` : '/admin/super/mentors';
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary mb-1">{t('pageTitle')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('intro')}</p>

      <AddMentorForm />
      <SearchBox placeholder={t('searchPlaceholder')} />

      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          href={buildHref(0, null)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            !activeStatus ? 'bg-primary text-white border-primary' : 'border-[var(--color-border)] text-[var(--color-muted)]'
          }`}
        >
          {t('filters.all')}
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={buildHref(0, s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition ${
              activeStatus === s ? 'bg-primary text-white border-primary' : 'border-[var(--color-border)] text-[var(--color-muted)]'
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <MentorsTable rows={items} />
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} buildHref={buildHref} t={tPagination} />
    </div>
  );
}
