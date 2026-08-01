'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import type { SuperAdminMentorRow } from '@/lib/super-admin';
import { approveMentor, deleteMentor } from './actions';

const STATUS_CLASS: Record<string, string> = {
  approved: 'text-green-600',
  pending: 'text-amber-600',
  suspended: 'text-red-600',
};

export function MentorsTable({ rows }: { rows: SuperAdminMentorRow[] }) {
  const t = useTranslations('Admin.superAdmin.mentors');
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'approve' | 'delete' | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (rows.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="font-medium">{t('emptyTitle')}</p>
        <p className="text-sm text-[var(--color-muted)] mt-1">{t('emptyDescription')}</p>
      </div>
    );
  }

  function handleApprove(userId: string) {
    setError(null);
    setPendingId(userId);
    setPendingAction('approve');
    startTransition(async () => {
      const result = await approveMentor(userId);
      setPendingId(null);
      setPendingAction(null);
      if (!result.ok) setError(result.message);
    });
  }

  function handleDelete(row: SuperAdminMentorRow) {
    const email = row.email ?? t('thisUser');
    const message =
      row.active_mentees > 0
        ? t('deleteConfirmActiveMessage', { email, count: row.active_mentees })
        : t('deleteConfirmMessage', { email });
    if (!window.confirm(message)) return;

    setError(null);
    setPendingId(row.user_id);
    setPendingAction('delete');
    startTransition(async () => {
      const result = await deleteMentor(row.user_id);
      setPendingId(null);
      setPendingAction(null);
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
            <th className="px-4 py-3 font-medium">{t('columns.status')}</th>
            <th className="px-4 py-3 font-medium">{t('columns.mentees')}</th>
            <th className="px-4 py-3 font-medium text-right">{t('columns.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {rows.map((row) => (
            <tr key={row.user_id}>
              <td className="px-4 py-3 font-medium">{row.full_name ?? '—'}</td>
              <td className="px-4 py-3 text-[var(--color-muted)] truncate max-w-[200px]">{row.email ?? '—'}</td>
              <td className={`px-4 py-3 font-medium ${STATUS_CLASS[row.status] ?? ''}`}>{row.status}</td>
              <td className="px-4 py-3">
                {row.active_mentees}/{row.max_students}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-3">
                  {row.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(row.user_id)}
                      disabled={isPending && pendingId === row.user_id}
                      className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                    >
                      {isPending && pendingId === row.user_id && pendingAction === 'approve' ? t('approving') : t('approve')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(row)}
                    disabled={isPending && pendingId === row.user_id}
                    className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    {isPending && pendingId === row.user_id && pendingAction === 'delete' ? t('deleting') : t('delete')}
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
