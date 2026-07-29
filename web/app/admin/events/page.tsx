import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { requireAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { AdminEventsList, type AdminEventListItem } from './AdminEventsList';

interface AdminEventRow {
  id: string;
  title: string;
  event_date: string;
  location_type: string;
  status: string;
  event_registrations: { count: number }[];
}

export default async function AdminEventsPage() {
  const [session, t] = await Promise.all([requireAdminSession(), getTranslations('Admin.events')]);
  const client = createUserClient(session.accessToken);

  const { data } = await client
    .from('events')
    .select('id, title, event_date, location_type, status, event_registrations(count)')
    .order('event_date', { ascending: false })
    .limit(200)
    .returns<AdminEventRow[]>();

  const events: AdminEventListItem[] = (data ?? []).map((event) => ({
    id: event.id,
    title: event.title,
    event_date: event.event_date,
    location_type: event.location_type,
    status: event.status,
    registrationCount: event.event_registrations?.[0]?.count ?? 0,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-primary">{t('title')}</h1>
          <p className="text-sm text-[var(--color-muted)]">{t('subtitle')}</p>
        </div>
        <Link
          href="/admin/events/create"
          className="shrink-0 rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition"
        >
          {t('createNew')}
        </Link>
      </div>

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <AdminEventsList events={events} />
      </section>
    </div>
  );
}
