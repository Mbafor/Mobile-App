import Link from 'next/link';

type PaginationTranslate = (key: string, values?: Record<string, string | number>) => string;

/** Server-renderable (no client JS needed) -- page navigation is plain <Link>s
 * to the same route with a different `page` query param, so the caller's
 * server component re-fetches with the new offset. `t` should already be
 * scoped to the Admin.superAdmin.pagination namespace. */
export function Pagination({
  page,
  pageSize,
  total,
  buildHref,
  t,
}: {
  page: number;
  pageSize: number;
  total: number;
  buildHref: (page: number) => string;
  t: PaginationTranslate;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : page * pageSize + 1;
  const end = Math.min(total, (page + 1) * pageSize);

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap mt-4 text-sm">
      <p className="text-[var(--color-muted)]">{t('range', { start, end, total })}</p>
      <div className="flex items-center gap-3">
        {page > 0 ? (
          <Link
            href={buildHref(page - 1)}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 hover:bg-[var(--color-surface)] transition"
          >
            {t('prev')}
          </Link>
        ) : (
          <span className="rounded-md border border-[var(--color-border)] px-3 py-1.5 opacity-40">{t('prev')}</span>
        )}
        <span>{t('pageOfTotal', { page: page + 1, totalPages })}</span>
        {page + 1 < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 hover:bg-[var(--color-surface)] transition"
          >
            {t('next')}
          </Link>
        ) : (
          <span className="rounded-md border border-[var(--color-border)] px-3 py-1.5 opacity-40">{t('next')}</span>
        )}
      </div>
    </div>
  );
}
