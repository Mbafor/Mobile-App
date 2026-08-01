'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { deleteAdminOpportunity } from './actions';

export interface ManagedOpportunityListItem {
  id: string;
  title: string;
  organization: string;
  imageUrl: string | null;
  deadline: string | null;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

export function ManageOpportunitiesList({ opportunities }: { opportunities: ManagedOpportunityListItem[] }) {
  const t = useTranslations('Admin.opportunities.list');
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (opportunities.length === 0) {
    return <p className="text-sm text-[var(--color-muted)] p-4">{t('empty')}</p>;
  }

  function handleDelete(id: string, title: string) {
    if (!window.confirm(t('confirmDelete', { title }))) return;
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await deleteAdminOpportunity(id);
      setPendingId(null);
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
          <li key={opp.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-[220px] flex-1">
              {opp.imageUrl ? (
                <Image
                  src={opp.imageUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-md object-cover shrink-0 bg-[var(--color-surface)]"
                  unoptimized
                />
              ) : (
                <div className="h-12 w-12 rounded-md bg-[var(--color-surface)] flex items-center justify-center text-sm font-semibold text-[var(--color-muted)] shrink-0">
                  {opp.organization.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-medium">{opp.title}</p>
                <p className="text-sm text-[var(--color-muted)]">{opp.organization}</p>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">
                  {t('deadline', { date: opp.deadline ? dateFormatter.format(new Date(opp.deadline)) : t('rolling') })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 whitespace-nowrap">
              <Link href={`/admin/opportunities/${opp.id}`} className="text-primary font-medium text-sm hover:underline">
                {t('edit')}
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(opp.id, opp.title)}
                disabled={isPending && pendingId === opp.id}
                className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
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
