'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import type { ShareableOpportunity } from '@/lib/partner-share-template';
import { deletePartnerOpportunity } from './actions';

export function ManageOpportunitiesList({ opportunities }: { opportunities: ShareableOpportunity[] }) {
  const t = useTranslations('Partner.manage');
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (opportunities.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">{t('empty')}</p>;
  }

  function handleDelete(id: string, title: string) {
    if (!window.confirm(t('confirmDelete', { title }))) return;
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await deletePartnerOpportunity(id);
      setPendingId(null);
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}
      <ul className="divide-y divide-[var(--color-border)]">
        {opportunities.map((opp) => (
          <li key={opp.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{opp.title}</p>
              <p className="text-xs text-[var(--color-muted)] truncate">{opp.organization}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/partner/dashboard/${opp.id}/edit`}
                className="text-sm text-[var(--color-forest)] font-medium hover:underline"
              >
                {t('edit')}
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(opp.id, opp.title)}
                disabled={isPending && pendingId === opp.id}
                className="text-sm text-red-600 font-medium hover:underline disabled:opacity-50"
              >
                {isPending && pendingId === opp.id ? t('deleting') : t('delete')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
