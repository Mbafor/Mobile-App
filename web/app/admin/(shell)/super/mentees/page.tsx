import { getTranslations } from 'next-intl/server';

import { requireSuperAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { parsePaginated, type SuperAdminMenteeRow } from '@/lib/super-admin';
import { SearchBox } from '../_shared/SearchBox';
import { Pagination } from '../_shared/Pagination';

const PAGE_SIZE = 15;
const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

export default async function SuperAdminMenteesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search, page: pageParam } = await searchParams;
  const page = Math.max(0, Number(pageParam) || 0);

  const [session, t, tPagination] = await Promise.all([
    requireSuperAdminSession(),
    getTranslations('Admin.superAdmin.mentees'),
    getTranslations('Admin.superAdmin.pagination'),
  ]);
  const client = createUserClient(session.accessToken);

  const { data } = await client.rpc('get_super_admin_mentees', {
    p_search: search?.trim() || null,
    p_limit: PAGE_SIZE,
    p_offset: page * PAGE_SIZE,
  });
  const { items, total } = parsePaginated<SuperAdminMenteeRow>(data);

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();
    if (search?.trim()) params.set('search', search.trim());
    if (nextPage > 0) params.set('page', String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/super/mentees?${qs}` : '/admin/super/mentees';
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary mb-1">{t('pageTitle')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('subtitle')}</p>

      <SearchBox placeholder={t('searchPlaceholder')} />

      {items.length === 0 ? (
        <div className="p-8 text-center bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
          <p className="font-medium">{t('emptyTitle')}</p>
          <p className="text-sm text-[var(--color-muted)] mt-1">{t('emptyDescription')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.mentorship_id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
              <p className="font-medium">{m.student_name ?? t('studentFallback')}</p>
              <p className="text-sm text-[var(--color-muted)]">{m.student_email}</p>
              <p className="text-sm mt-1">{t('coachLabel', { name: m.mentor_name ?? '—' })}</p>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                {dateFormatter.format(new Date(m.started_at))} → {dateFormatter.format(new Date(m.ends_at))}
              </p>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} buildHref={buildHref} t={tPagination} />
    </div>
  );
}
