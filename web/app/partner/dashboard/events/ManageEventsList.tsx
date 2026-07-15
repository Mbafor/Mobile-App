'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { deletePartnerEvent } from './actions';

export interface PartnerEventListItem {
  id: string;
  title: string;
  event_date: string;
  location_type: string;
}

export function ManageEventsList({ events }: { events: PartnerEventListItem[] }) {
  const t = useTranslations('Partner.events.manage');
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (events.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">{t('empty')}</p>;
  }

  function handleDelete(id: string, title: string) {
    if (!window.confirm(t('confirmDelete', { title }))) return;
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await deletePartnerEvent(id);
      setPendingId(null);
      if (!result.ok) setError(result.message);
    });
  }

  const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}
      <ul className="divide-y divide-[var(--color-border)]">
        {events.map((event) => (
          <li key={event.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{event.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-[var(--color-muted)] truncate">
                  {dateFormatter.format(new Date(event.event_date))}
                </p>
                <span className="shrink-0 rounded-full bg-[var(--color-forest)]/10 text-[var(--color-forest)] px-2 py-0.5 text-[11px] font-medium">
                  {event.location_type === 'in_person' ? t('inPerson') : t('virtual')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/partner/dashboard/events/${event.id}/edit`}
                className="text-sm text-[var(--color-forest)] font-medium hover:underline"
              >
                {t('edit')}
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(event.id, event.title)}
                disabled={isPending && pendingId === event.id}
                className="text-sm text-red-600 font-medium hover:underline disabled:opacity-50"
              >
                {isPending && pendingId === event.id ? t('deleting') : t('delete')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
