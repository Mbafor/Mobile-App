'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { quickApproveAdminOpportunity, rejectAdminOpportunity } from '../actions';

export interface PendingOpportunityListItem {
  id: string;
  title: string;
  organization: string;
  category: string | null;
  country: string | null;
  source: string | null;
  deadline: string | null;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

export function PendingQueueList({ opportunities }: { opportunities: PendingOpportunityListItem[] }) {
  const t = useTranslations('Admin.opportunities.queue');
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (opportunities.length === 0) {
    return <p className="text-sm text-[var(--color-muted)] p-4">{t('empty')}</p>;
  }

  function handleApprove(id: string, title: string) {
    if (!window.confirm(t('confirmApprove', { title }))) return;
    setError(null);
    setPendingId(id);
    setPendingAction('approve');
    startTransition(async () => {
      const result = await quickApproveAdminOpportunity(id);
      setPendingId(null);
      setPendingAction(null);
      if (!result.ok) setError(result.message);
    });
  }

  function handleReject(id: string, title: string) {
    if (!window.confirm(t('confirmReject', { title }))) return;
    setError(null);
    setPendingId(id);
    setPendingAction('reject');
    startTransition(async () => {
      const result = await rejectAdminOpportunity(id);
      setPendingId(null);
      setPendingAction(null);
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <div>
      {error && (
        <p className="m-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}
      <ul className="divide-y divide-[var(--color-border)]">
        {opportunities.map((opp) => (
          <li key={opp.id} className="p-4 flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-[220px] flex-1">
              <Link href={`/admin/opportunities/${opp.id}`} className="font-medium hover:underline">
                {opp.title}
              </Link>
              <p className="text-sm text-[var(--color-muted)]">{opp.organization}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {opp.category && (
                  <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-medium">
                    {opp.category}
                  </span>
                )}
                {opp.country && (
                  <span className="rounded-full bg-[var(--color-border)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-muted)]">
                    {opp.country}
                  </span>
                )}
                {opp.source && (
                  <span className="rounded-full bg-[var(--color-border)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-muted)]">
                    {opp.source}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-2">
                {t('deadline', { date: opp.deadline ? dateFormatter.format(new Date(opp.deadline)) : t('deadlineNotSet') })}
              </p>
            </div>

            <div className="flex items-center gap-3 whitespace-nowrap">
              <Link href={`/admin/opportunities/${opp.id}`} className="text-primary font-medium text-sm hover:underline">
                {t('review')}
              </Link>
              <button
                type="button"
                onClick={() => handleApprove(opp.id, opp.title)}
                disabled={isPending && pendingId === opp.id}
                className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
              >
                {isPending && pendingId === opp.id && pendingAction === 'approve' ? t('approving') : t('approve')}
              </button>
              <button
                type="button"
                onClick={() => handleReject(opp.id, opp.title)}
                disabled={isPending && pendingId === opp.id}
                className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
              >
                {isPending && pendingId === opp.id && pendingAction === 'reject' ? t('rejecting') : t('reject')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
