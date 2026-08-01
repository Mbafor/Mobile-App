import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { requireAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { EventForm } from '@/app/events/_shared/EventForm';
import { updateAdminEvent } from '../../actions';

export default async function AdminEditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, t] = await Promise.all([requireAdminSession(), getTranslations('Admin.events.editForm')]);
  const client = createUserClient(session.accessToken);

  // No owner filter here -- admins can edit any event (current_user_can_manage_events(),
  // 053_events.sql), including ones partners posted.
  const { data: event } = await client
    .from('events')
    .select(
      'id, title, tagline, description, takeaways, host_name, host_bio, event_date, end_time, timezone, location_type, location_platform, meeting_link, capacity, register_link, image_url, category',
    )
    .eq('id', id)
    .maybeSingle();

  if (!event) notFound();

  const boundUpdate = updateAdminEvent.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary mb-1">{t('title')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('subtitle')}</p>

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4">
        <EventForm
          action={boundUpdate}
          initialValues={{
            title: event.title,
            tagline: event.tagline ?? '',
            description: event.description,
            takeaways: (event.takeaways ?? []).join('\n'),
            hostName: event.host_name ?? '',
            hostBio: event.host_bio ?? '',
            eventDate: toDatetimeLocalValue(event.event_date),
            endTime: event.end_time ? toDatetimeLocalValue(event.end_time) : '',
            timezone: event.timezone ?? 'GMT',
            locationType: event.location_type,
            locationPlatform: event.location_platform ?? '',
            meetingLink: event.meeting_link ?? '',
            capacity: event.capacity ? String(event.capacity) : '',
            registerLink: event.register_link ?? '',
            category: event.category ?? '',
            imageUrl: event.image_url ?? '',
          }}
          submitLabel={t('submit')}
          pendingLabel={t('pending')}
          successMessage={t('success')}
        />
      </section>
    </div>
  );
}

/** Converts a stored timestamptz ISO string to the `YYYY-MM-DDTHH:mm` value a
 * native <input type="datetime-local"> expects, in the server's local time
 * (matching how parseEventForm re-parses the same shape on submit). */
function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
