'use server';

import { revalidatePath } from 'next/cache';

import { requirePartnerSession } from '@/lib/partner-session';
import { createPartnerClient } from '@/lib/supabase-server';
import { parsePartnerEventForm, resolveEventImageUrl } from '../parse-event-form';

export type CreateEventResult = { ok: true } | { ok: false; message: string };

export async function createPartnerEvent(formData: FormData): Promise<CreateEventResult> {
  const session = await requirePartnerSession();

  const parsed = parsePartnerEventForm(formData);
  if (!parsed.ok) return parsed;
  const data = parsed.data;

  const client = createPartnerClient(session.accessToken);

  const image = await resolveEventImageUrl(client, formData);
  if (!image.ok) return image;

  const { error: insertError } = await client.from('events').insert({
    title: data.title,
    description: data.description,
    event_date: data.eventDateIso,
    location_type: data.locationType,
    location_or_link: data.locationOrLink,
    register_link: data.registerLink,
    category: data.category,
    image_url: image.url,
    owner_type: 'partner',
    owner_id: session.partner.id,
    status: 'upcoming',
  });

  if (insertError) {
    return { ok: false, message: insertError.message };
  }

  revalidatePath('/partner/dashboard/events');

  return { ok: true };
}
