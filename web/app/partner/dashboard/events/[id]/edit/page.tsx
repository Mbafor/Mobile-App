import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { requirePartnerSession } from '@/lib/partner-session';
import { createPartnerClient } from '@/lib/supabase-server';
import { PartnerEventForm } from '../../PartnerEventForm';
import { updatePartnerEvent } from '../../actions';

export default async function PartnerEditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, t] = await Promise.all([requirePartnerSession(), getTranslations('Partner.events.edit')]);
  const client = createPartnerClient(session.accessToken);

  // Ownership check: events carry owner_type/owner_id directly on the row
  // (migration 053_events.sql), so this is a single direct filter -- no join
  // table lookup needed, unlike opportunities' partner_posts check. The
  // select RLS policy would let any partner load a non-cancelled event by
  // id, so this guards the edit form itself; the update action is
  // separately enforced at the database layer via current_partner_owns_event().
  const { data: event } = await client
    .from('events')
    .select(
      'id, title, description, event_date, location_type, location_or_link, register_link, image_url, category',
    )
    .eq('id', id)
    .eq('owner_type', 'partner')
    .eq('owner_id', session.partner.id)
    .maybeSingle();

  if (!event) notFound();

  const boundUpdate = updatePartnerEvent.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--color-forest)] mb-1">{t('title')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('subtitle')}</p>

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4">
        <PartnerEventForm
          action={boundUpdate}
          initialValues={{
            title: event.title,
            description: event.description,
            eventDate: toDatetimeLocalValue(event.event_date),
            locationType: event.location_type,
            locationOrLink: event.location_or_link ?? '',
            registerLink: event.register_link,
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
 * (matching how parsePartnerEventForm re-parses the same shape on submit). */
function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
