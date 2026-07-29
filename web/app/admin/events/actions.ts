'use server';

import { revalidatePath } from 'next/cache';

import { requireAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { generateEventSlug, parseEventForm, resolveEventImageUrl } from '@/app/events/_shared/parse-event-form';

export type AdminEventMutationResult = { ok: true } | { ok: false; message: string };

/** Creates a new admin-posted event. Unlike partner events (owned by the
 * posting partner), admin-created events are owned by the admin who created
 * them (owner_type='admin', owner_id=that admin's own profile id) -- but per
 * current_user_can_manage_events() (053_events.sql) any admin/super-admin can
 * still edit or delete it afterwards, same as every other event regardless
 * of owner. */
export async function createAdminEvent(formData: FormData): Promise<AdminEventMutationResult> {
  const session = await requireAdminSession();

  const parsed = parseEventForm(formData);
  if (!parsed.ok) return parsed;
  const data = parsed.data;

  const client = createUserClient(session.accessToken);

  const image = await resolveEventImageUrl(client, formData);
  if (!image.ok) return image;

  let slug = generateEventSlug(data.title);
  let insertError: { code?: string; message: string } | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const { error } = await client.from('events').insert({
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
      owner_type: 'admin',
      owner_id: session.admin.id,
      status: 'upcoming',
      slug,
    });

    if (!error) {
      insertError = null;
      break;
    }
    if (error.code === '23505' && error.message.includes('idx_events_slug')) {
      slug = generateEventSlug(data.title);
      insertError = error;
      continue;
    }
    insertError = error;
    break;
  }

  if (insertError) return { ok: false, message: insertError.message };

  revalidatePath('/admin/events');
  revalidatePath('/events');

  return { ok: true };
}

/** Updates any event -- admins can manage events regardless of who posted
 * them (current_user_can_manage_events() carries no owner check), so unlike
 * the partner update action there's no owner_type/owner_id filter here. */
export async function updateAdminEvent(eventId: string, formData: FormData): Promise<AdminEventMutationResult> {
  const session = await requireAdminSession();

  const parsed = parseEventForm(formData);
  if (!parsed.ok) return parsed;
  const data = parsed.data;

  const client = createUserClient(session.accessToken);

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
    .select('id, slug')
    .maybeSingle();

  if (error) return { ok: false, message: error.message };
  if (!updated) return { ok: false, message: 'Event not found.' };

  revalidatePath('/admin/events');
  revalidatePath(`/admin/events/${eventId}/edit`);
  revalidatePath(`/events/${updated.slug}`);

  return { ok: true };
}

export async function deleteAdminEvent(eventId: string): Promise<AdminEventMutationResult> {
  const session = await requireAdminSession();
  const client = createUserClient(session.accessToken);

  const { error, count } = await client.from('events').delete({ count: 'exact' }).eq('id', eventId);

  if (error) return { ok: false, message: error.message };
  if (!count) return { ok: false, message: 'Event not found.' };

  revalidatePath('/admin/events');
  revalidatePath('/events');

  return { ok: true };
}

/** Cancels an event without deleting it -- keeps registration history intact
 * (event_registrations cascades on delete but not on a status change) while
 * removing it from public listings, since "Anyone can read non-cancelled
 * events" (053_events.sql) excludes status='cancelled'. */
export async function cancelAdminEvent(eventId: string): Promise<AdminEventMutationResult> {
  const session = await requireAdminSession();
  const client = createUserClient(session.accessToken);

  const { error, count } = await client
    .from('events')
    .update({ status: 'cancelled' }, { count: 'exact' })
    .eq('id', eventId);

  if (error) return { ok: false, message: error.message };
  if (!count) return { ok: false, message: 'Event not found.' };

  revalidatePath('/admin/events');
  revalidatePath('/events');

  return { ok: true };
}
