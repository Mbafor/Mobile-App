'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import type { SuperAdminPartnerRow } from '@/lib/super-admin';
import { setPartnerActive } from './actions';

export function PartnersTable({ rows }: { rows: SuperAdminPartnerRow[] }) {
  const t = useTranslations('Admin.superAdmin.partners');
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (rows.length === 0) {
    return <p className="text-sm text-[var(--color-muted)] p-4">{t('emptySearch')}</p>;
  }

  function handleToggleActive(row: SuperAdminPartnerRow) {
    const nextActive = !row.is_active;
    const message = nextActive
      ? t('activateConfirmMessage', { org: row.org_name })
      : t('deactivateConfirmMessage', { org: row.org_name });
    if (!window.confirm(message)) return;

    setError(null);
    setPendingId(row.id);
    startTransition(async () => {
      const result = await setPartnerActive(row.id, nextActive);
      setPendingId(null);
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <div className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] overflow-hidden overflow-x-auto">
      {error && (
        <p className="m-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)] uppercase tracking-wide">
            <th className="px-4 py-3 font-medium">{t('columns.organization')}</th>
            <th className="px-4 py-3 font-medium">{t('columns.email')}</th>
            <th className="px-4 py-3 font-medium">{t('columns.slug')}</th>
            <th className="px-4 py-3 font-medium">{t('columns.posts')}</th>
            <th className="px-4 py-3 font-medium">{t('columns.status')}</th>
            <th className="px-4 py-3 font-medium text-right">{t('columns.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3 font-medium">{row.org_name}</td>
              <td className="px-4 py-3 text-[var(--color-muted)] truncate max-w-[200px]">{row.contact_email}</td>
              <td className="px-4 py-3">
                <a
                  href={`/partner/${row.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  /{row.slug}
                </a>
              </td>
              <td className="px-4 py-3 font-semibold text-primary">{row.opportunities_posted}</td>
              <td className="px-4 py-3">
                <span className={row.is_active ? 'text-green-600 font-medium' : 'text-[var(--color-muted)]'}>
                  {row.is_active ? t('active') : t('inactive')}
                </span>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-3">
                  <Link href={`/admin/super/partners/${row.id}/edit`} className="text-primary font-medium hover:underline">
                    {t('edit')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(row)}
                    disabled={isPending && pendingId === row.id}
                    className={`font-medium hover:underline disabled:opacity-50 ${
                      row.is_active ? 'text-red-600' : 'text-primary'
                    }`}
                  >
                    {isPending && pendingId === row.id
                      ? t('updating')
                      : row.is_active
                        ? t('deactivate')
                        : t('activate')}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
