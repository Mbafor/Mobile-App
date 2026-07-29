'use server';

import { revalidatePath } from 'next/cache';

import { requirePartnerSession } from '@/lib/partner-session';
import { createPartnerClient } from '@/lib/supabase-server';
import { generateEventSlug, parseEventForm, resolveEventImageUrl } from '@/app/events/_shared/parse-event-form';

export type CreateEventResult = { ok: true } | { ok: false; message: string };

export async function createPartnerEvent(formData: FormData): Promise<CreateEventResult> {
  const session = await requirePartnerSession();

  const parsed = parseEventForm(formData);
  if (!parsed.ok) return parsed;
  const data = parsed.data;

  const client = createPartnerClient(session.accessToken);

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
      owner_type: 'partner',
      owner_id: session.partner.id,
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

  revalidatePath('/partner/dashboard/events');
  revalidatePath('/events');

  return { ok: true };
}
