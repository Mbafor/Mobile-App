import { getTranslations } from 'next-intl/server';

import { requireSuperAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { parsePaginated, type SuperAdminMentorshipExitRow } from '@/lib/super-admin';
import { SearchBox } from '../_shared/SearchBox';
import { Pagination } from '../_shared/Pagination';

const PAGE_SIZE = 15;
const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

const STATUS_CLASS: Record<string, string> = {
  left_by_student: 'text-amber-600',
  removed_by_mentor: 'text-red-600',
};

export default async function SuperAdminMentorshipExitsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search, page: pageParam } = await searchParams;
  const page = Math.max(0, Number(pageParam) || 0);

  const [session, t, tPagination] = await Promise.all([
    requireSuperAdminSession(),
    getTranslations('Admin.superAdmin.mentorshipExits'),
    getTranslations('Admin.superAdmin.pagination'),
  ]);
  const client = createUserClient(session.accessToken);

  const { data } = await client.rpc('get_super_admin_mentorship_exits', {
    p_search: search?.trim() || null,
    p_limit: PAGE_SIZE,
    p_offset: page * PAGE_SIZE,
  });
  const { items, total } = parsePaginated<SuperAdminMentorshipExitRow>(data);

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();
    if (search?.trim()) params.set('search', search.trim());
    if (nextPage > 0) params.set('page', String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/super/mentorship-exits?${qs}` : '/admin/super/mentorship-exits';
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
          {items.map((row) => (
            <div
              key={row.mentorship_id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{row.student_name ?? t('studentFallback')}</p>
                  <p className="text-sm text-[var(--color-muted)]">{row.student_email}</p>
                  <p className="text-sm mt-1">{t('coachLabel', { name: row.mentor_name ?? '—' })}</p>
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${STATUS_CLASS[row.status] ?? ''}`}>
                  {t(`status.${row.status}`, { defaultValue: row.status })}
                </span>
              </div>

              <p className="text-sm mt-3 whitespace-pre-wrap">
                {row.end_reason?.trim() || <span className="italic text-[var(--color-muted)]">{t('noReason')}</span>}
              </p>

              <p className="text-xs text-[var(--color-muted)] mt-2">
                {dateFormatter.format(new Date(row.started_at))} →{' '}
                {row.ended_at ? dateFormatter.format(new Date(row.ended_at)) : '—'}
              </p>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} buildHref={buildHref} t={tPagination} />
    </div>
  );
}
