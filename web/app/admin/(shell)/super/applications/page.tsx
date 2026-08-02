import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { requireSuperAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { SearchBox } from '../_shared/SearchBox';
import { Pagination } from '../_shared/Pagination';

const PAGE_SIZE = 20;

interface MentorApplicationRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  area_of_expertise: string;
  years_of_experience: string;
  status: string;
  submitted_at: string;
}

const STATUS_CLASS: Record<string, string> = {
  approved: 'text-green-600',
  pending: 'text-amber-600',
  rejected: 'text-red-600',
};

export default async function SuperAdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search, page: pageParam } = await searchParams;
  const page = Math.max(0, Number(pageParam) || 0);

  const [session, t, tPagination] = await Promise.all([
    requireSuperAdminSession(),
    getTranslations('Admin.superAdmin.applications'),
    getTranslations('Admin.superAdmin.pagination'),
  ]);
  const client = createUserClient(session.accessToken);

  const term = search?.trim();
  let query = client
    .from('mentor_applications')
    .select('id, first_name, last_name, email, area_of_expertise, years_of_experience, status, submitted_at', {
      count: 'exact',
    });

  if (term) {
    query = query.or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,area_of_expertise.ilike.%${term}%`,
    );
  }

  const { data, count } = await query
    .order('submitted_at', { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
    .returns<MentorApplicationRow[]>();

  const rows = data ?? [];
  const total = count ?? 0;

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();
    if (search?.trim()) params.set('search', search.trim());
    if (nextPage > 0) params.set('page', String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/super/applications?${qs}` : '/admin/super/applications';
  }

  const exportHref = search?.trim()
    ? `/admin/super/applications/export?search=${encodeURIComponent(search.trim())}`
    : '/admin/super/applications/export';

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-primary mb-1">{t('pageTitle')}</h1>
          <p className="text-sm text-[var(--color-muted)]">{t('intro')}</p>
        </div>
        <a
          href={exportHref}
          className="shrink-0 rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-background)] transition"
        >
          {t('downloadCsv')}
        </a>
      </div>

      <SearchBox placeholder={t('searchPlaceholder')} />

      {rows.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)] p-4">{t('emptySearch')}</p>
      ) : (
        <div className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)] uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">{t('columns.name')}</th>
                <th className="px-4 py-3 font-medium">{t('columns.email')}</th>
                <th className="px-4 py-3 font-medium">{t('columns.role')}</th>
                <th className="px-4 py-3 font-medium">{t('columns.experience')}</th>
                <th className="px-4 py-3 font-medium">{t('columns.status')}</th>
                <th className="px-4 py-3 font-medium">{t('columns.submitted')}</th>
                <th className="px-4 py-3 font-medium text-right">{t('columns.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">
                    {row.first_name} {row.last_name}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)] truncate max-w-[200px]">{row.email}</td>
                  <td className="px-4 py-3">{row.area_of_expertise}</td>
                  <td className="px-4 py-3">{row.years_of_experience}</td>
                  <td className={`px-4 py-3 font-medium capitalize ${STATUS_CLASS[row.status] ?? ''}`}>
                    {row.status}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)] whitespace-nowrap">
                    {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(row.submitted_at))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/super/applications/${row.id}`} className="text-primary font-medium hover:underline">
                      {t('view')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} buildHref={buildHref} t={tPagination} />
    </div>
  );
}
