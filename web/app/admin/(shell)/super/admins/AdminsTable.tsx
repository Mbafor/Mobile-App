'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import type { SuperAdminAdminRow } from '@/lib/super-admin';
import { revokeAdmin } from './actions';

export function AdminsTable({ rows }: { rows: SuperAdminAdminRow[] }) {
  const t = useTranslations('Admin.superAdmin.admins');
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (rows.length === 0) {
    return <p className="text-sm text-[var(--color-muted)] p-4">{t('emptySearch')}</p>;
  }

  function handleRevoke(id: string, email: string | null) {
    if (!window.confirm(t('removeConfirmMessage', { email: email ?? t('thisUser') }))) return;
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await revokeAdmin(id);
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
            <th className="px-4 py-3 font-medium">{t('columns.name')}</th>
            <th className="px-4 py-3 font-medium">{t('columns.email')}</th>
            <th className="px-4 py-3 font-medium">{t('columns.role')}</th>
            <th className="px-4 py-3 font-medium">{t('columns.posts')}</th>
            <th className="px-4 py-3 font-medium text-right">{t('columns.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3 font-medium">{row.full_name ?? '—'}</td>
              <td className="px-4 py-3 text-[var(--color-muted)] truncate max-w-[200px]">{row.email ?? '—'}</td>
              <td className="px-4 py-3">
                {row.is_super_admin
                  ? t('roleLabels.superAdmin')
                  : row.is_admin
                    ? t('roleLabels.opportunityAdmin')
                    : '—'}
              </td>
              <td className="px-4 py-3 font-semibold text-primary">{row.opportunities_posted ?? 0}</td>
              <td className="px-4 py-3 text-right">
                {row.is_admin && !row.is_super_admin ? (
                  <button
                    type="button"
                    onClick={() => handleRevoke(row.id, row.email)}
                    disabled={isPending && pendingId === row.id}
                    className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    {isPending && pendingId === row.id ? t('removing') : t('remove')}
                  </button>
                ) : (
                  <span className="text-[var(--color-muted)]">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
