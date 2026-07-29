'use server';

import { revalidatePath } from 'next/cache';

import { requirePartnerSession } from '@/lib/partner-session';
import { createPartnerClient } from '@/lib/supabase-server';
import { parseEventForm, resolveEventImageUrl } from '@/app/events/_shared/parse-event-form';

export type PartnerEventMutationResult = { ok: true } | { ok: false; message: string };

/** Updates an event the partner owns themselves. RLS (see migration
 * 053_events.sql, current_partner_owns_event()) enforces ownership at the
 * database layer, so a 0-row result here just as easily means "not yours" as
 * "not found". The explicit owner_type/owner_id filters below are a
 * belt-and-suspenders check for a clean error message. */
export async function updatePartnerEvent(
  eventId: string,
  formData: FormData,
): Promise<PartnerEventMutationResult> {
  const session = await requirePartnerSession();

  const parsed = parseEventForm(formData);
  if (!parsed.ok) return parsed;
  const data = parsed.data;

  const client = createPartnerClient(session.accessToken);

  const image = await resolveEventImageUrl(client, formData);
  if (!image.ok) return image;

  const { data: updated, error } = await client
    .from('events')
    .update({
      title: data.title,
      tagline: data.tagline,
      description: data.description,
      takeaways: data.takeaways,
      host_name: data.hostName,
      host_bio: data.hostBio,
      event_date: data.eventDateIso,
      end_time: data.endTimeIso,
      timezone: data.timezone,
      location_type: data.locationType,
      location_platform: data.locationPlatform,
      meeting_link: data.meetingLink,
      capacity: data.capacity,
      register_link: data.registerLink,
      category: data.category,
      image_url: image.url,
    })
    .eq('id', eventId)
    .eq('owner_type', 'partner')
    .eq('owner_id', session.partner.id)
    .select('id, slug')
    .maybeSingle();

  if (error) return { ok: false, message: error.message };
  if (!updated) return { ok: false, message: 'Event not found or no longer yours to edit.' };

  revalidatePath('/partner/dashboard/events');
  revalidatePath(`/partner/dashboard/events/${eventId}/edit`);
  revalidatePath(`/events/${updated.slug}`);

  return { ok: true };
}

/** Deletes an event the partner owns themselves. */
export async function deletePartnerEvent(eventId: string): Promise<PartnerEventMutationResult> {
  const session = await requirePartnerSession();
  const client = createPartnerClient(session.accessToken);

  const { error, count } = await client
    .from('events')
    .delete({ count: 'exact' })
    .eq('id', eventId)
    .eq('owner_type', 'partner')
    .eq('owner_id', session.partner.id);

  if (error) return { ok: false, message: error.message };
  if (!count) return { ok: false, message: 'Event not found or no longer yours to delete.' };

  revalidatePath('/partner/dashboard/events');

  return { ok: true };
}
