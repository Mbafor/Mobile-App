'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { cancelAdminEvent, deleteAdminEvent } from './actions';

export interface AdminEventListItem {
  id: string;
  title: string;
  event_date: string;
  location_type: string;
  status: string;
  registrationCount: number;
}

export function AdminEventsList({ events }: { events: AdminEventListItem[] }) {
  const t = useTranslations('Admin.events');
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'delete' | 'cancel' | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (events.length === 0) {
    return <p className="text-sm text-[var(--color-muted)] p-4">{t('empty')}</p>;
  }

  function handleDelete(id: string, title: string) {
    if (!window.confirm(t('confirmDelete', { title }))) return;
    setError(null);
    setPendingId(id);
    setPendingAction('delete');
    startTransition(async () => {
      const result = await deleteAdminEvent(id);
      setPendingId(null);
      setPendingAction(null);
      if (!result.ok) setError(result.message);
    });
  }

  function handleCancel(id: string, title: string) {
    if (!window.confirm(t('confirmCancel', { title }))) return;
    setError(null);
    setPendingId(id);
    setPendingAction('cancel');
    startTransition(async () => {
      const result = await cancelAdminEvent(id);
      setPendingId(null);
      setPendingAction(null);
      if (!result.ok) setError(result.message);
    });
  }

  const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div>
      {error && (
        <p className="m-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)] uppercase tracking-wide">
            <th className="px-4 py-3 font-medium">{t('columnTitle')}</th>
            <th className="px-4 py-3 font-medium">{t('columnDate')}</th>
            <th className="px-4 py-3 font-medium">{t('columnType')}</th>
            <th className="px-4 py-3 font-medium">{t('columnStatus')}</th>
            <th className="px-4 py-3 font-medium">{t('columnRegistrations')}</th>
            <th className="px-4 py-3 font-medium text-right">{t('columnActions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {events.map((event) => (
            <tr key={event.id}>
              <td className="px-4 py-3 font-medium truncate max-w-[220px]">{event.title}</td>
              <td className="px-4 py-3 text-[var(--color-muted)] whitespace-nowrap">
                {dateFormatter.format(new Date(event.event_date))}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-medium">
                  {event.location_type === 'in_person' ? t('inPerson') : t('virtual')}
                </span>
              </td>
              <td className="px-4 py-3 text-[var(--color-muted)] capitalize">{event.status}</td>
              <td className="px-4 py-3 font-medium">{event.registrationCount}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                  <a href={`/admin/events/${event.id}/export`} className="text-primary font-medium hover:underline">
                    {t('csv')}
                  </a>
                  <Link href={`/admin/events/${event.id}/edit`} className="text-primary font-medium hover:underline">
                    {t('edit')}
                  </Link>
                  {event.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => handleCancel(event.id, event.title)}
                      disabled={isPending && pendingId === event.id}
                      className="text-[var(--color-muted)] font-medium hover:underline disabled:opacity-50"
                    >
                      {isPending && pendingId === event.id && pendingAction === 'cancel' ? t('cancelling') : t('cancel')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id, event.title)}
                    disabled={isPending && pendingId === event.id}
                    className="text-red-600 font-medium hover:underline disabled:opacity-50"
                  >
                    {isPending && pendingId === event.id && pendingAction === 'delete' ? t('deleting') : t('delete')}
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
