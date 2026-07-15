/** Shared parse/validate logic for the partner "Create" and "Edit" event forms,
 * plus the shared image-resolution helper both actions need. Kept local to
 * app/partner/dashboard/events (rather than web/lib, like
 * partner-opportunity-form.ts) since this feature's file scope is
 * restricted to this directory. */

import { randomUUID } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ParsedPartnerEvent {
  title: string;
  description: string;
  eventDateIso: string;
  locationType: 'virtual' | 'in_person';
  locationOrLink: string | null;
  registerLink: string;
  category: string | null;
}

export type ParsePartnerEventResult =
  | { ok: true; data: ParsedPartnerEvent }
  | { ok: false; message: string };

function parseEventDate(dateInput: string): string | null {
  const trimmed = dateInput.trim();
  if (!trimmed) return null;
  // Native <input type="datetime-local"> values have no timezone designator,
  // so `new Date(...)` parses them in the server's local time -- fine here
  // since we only need a stable, valid instant to store as timestamptz.
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function parsePartnerEventForm(formData: FormData): ParsePartnerEventResult {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const eventDateInput = String(formData.get('eventDate') ?? '').trim();
  const locationTypeInput = String(formData.get('locationType') ?? '').trim();
  const locationOrLink = String(formData.get('locationOrLink') ?? '').trim();
  const registerLink = String(formData.get('registerLink') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();

  if (!title) {
    return { ok: false, message: 'Title is required.' };
  }
  if (!description) {
    return { ok: false, message: 'Description is required.' };
  }

  const eventDateIso = parseEventDate(eventDateInput);
  if (!eventDateIso) {
    return { ok: false, message: 'Enter a valid event date and time.' };
  }

  if (!registerLink) {
    return { ok: false, message: 'A registration link is required.' };
  }

  if (!category) {
    return { ok: false, message: 'Select a category.' };
  }

  const locationType = locationTypeInput === 'in_person' ? 'in_person' : 'virtual';

  return {
    ok: true,
    data: {
      title,
      description,
      eventDateIso,
      locationType,
      locationOrLink: locationOrLink || null,
      registerLink,
      category,
    },
  };
}

export type ResolveEventImageResult = { ok: true; url: string | null } | { ok: false; message: string };

/** Resolves the final image_url for a create/update: prefers an uploaded file
 * (formData.imageFile) over a pasted URL (formData.imageUrl) -- the two input
 * modes PartnerEventForm offers. Uploads go to the public event-images
 * bucket under the uploader's own folder, matching that bucket's
 * per-uploader-folder RLS policy (see migration 053_events.sql):
 * `(storage.foldername(name))[1] = auth.uid()::text`. That's the partner's
 * Supabase Auth user id (`partners.auth_user_id`), NOT `partners.id` (a
 * separate generated PK) -- so the folder must come from the authenticated
 * client's own session, not the caller-supplied partner id, or every upload
 * gets rejected by RLS. Must be called with a partner-scoped client
 * (createPartnerClient) for that to resolve to the right uid. */
export async function resolveEventImageUrl(
  client: SupabaseClient,
  formData: FormData,
): Promise<ResolveEventImageResult> {
  const file = formData.get('imageFile');
  if (file instanceof File && file.size > 0) {
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) return { ok: false, message: 'Could not verify your session for upload.' };

    const path = `${userData.user.id}/${randomUUID()}-${file.name}`;
    const { error: uploadError } = await client.storage
      .from('event-images')
      .upload(path, file, { contentType: file.type });
    if (uploadError) return { ok: false, message: uploadError.message };

    const { data } = client.storage.from('event-images').getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  }

  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  return { ok: true, url: imageUrl || null };
}
