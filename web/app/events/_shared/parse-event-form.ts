/** Shared parse/validate logic for the event create/edit forms used by both
 * the partner dashboard and the admin dashboard -- unlike most partner-only
 * form logic in this codebase (see the old per-directory duplication
 * precedent), this one genuinely needs to be identical for both audiences,
 * since the same public /events/[slug] page renders whichever of them
 * posted it. Lives under `_shared` (a Next.js private folder, excluded from
 * routing) rather than web/lib since it's events-feature-specific, not a
 * general utility. */

import { randomUUID } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ParsedEvent {
  title: string;
  tagline: string | null;
  description: string;
  takeaways: string[];
  hostName: string | null;
  hostBio: string | null;
  eventDateIso: string;
  endTimeIso: string;
  timezone: string;
  locationType: 'virtual' | 'in_person';
  locationPlatform: string | null;
  meetingLink: string | null;
  capacity: number | null;
  registerLink: string | null;
  category: string;
}

export type ParseEventResult = { ok: true; data: ParsedEvent } | { ok: false; message: string };

function parseDateInput(input: string): Date | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Native <input type="datetime-local"> values have no timezone designator,
  // so `new Date(...)` parses them in the server's local time -- fine here
  // since we only need a stable, valid instant to store as timestamptz.
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function parseEventForm(formData: FormData): ParseEventResult {
  const title = String(formData.get('title') ?? '').trim();
  const tagline = String(formData.get('tagline') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const takeawaysRaw = String(formData.get('takeaways') ?? '');
  const hostName = String(formData.get('hostName') ?? '').trim();
  const hostBio = String(formData.get('hostBio') ?? '').trim();
  const eventDateInput = String(formData.get('eventDate') ?? '').trim();
  const endTimeInput = String(formData.get('endTime') ?? '').trim();
  const timezoneInput = String(formData.get('timezone') ?? '').trim();
  const locationTypeInput = String(formData.get('locationType') ?? '').trim();
  const locationPlatform = String(formData.get('locationPlatform') ?? '').trim();
  const meetingLink = String(formData.get('meetingLink') ?? '').trim();
  const capacityInput = String(formData.get('capacity') ?? '').trim();
  const registerLink = String(formData.get('registerLink') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();

  if (!title) return { ok: false, message: 'Title is required.' };
  if (!description) return { ok: false, message: 'Description is required.' };

  const eventDate = parseDateInput(eventDateInput);
  if (!eventDate) return { ok: false, message: 'Enter a valid start date and time.' };

  const endTime = endTimeInput ? parseDateInput(endTimeInput) : new Date(eventDate.getTime() + 60 * 60 * 1000);
  if (!endTime) return { ok: false, message: 'Enter a valid end date and time.' };
  if (endTime.getTime() < eventDate.getTime()) {
    return { ok: false, message: 'End time must be after the start time.' };
  }

  if (!category) return { ok: false, message: 'Select a category.' };

  const locationType = locationTypeInput === 'in_person' ? 'in_person' : 'virtual';

  let capacity: number | null = null;
  if (capacityInput) {
    const n = Number(capacityInput);
    if (!Number.isInteger(n) || n <= 0) {
      return { ok: false, message: 'Capacity must be a positive whole number.' };
    }
    capacity = n;
  }

  const takeaways = takeawaysRaw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    ok: true,
    data: {
      title,
      tagline: tagline || null,
      description,
      takeaways,
      hostName: hostName || null,
      hostBio: hostBio || null,
      eventDateIso: eventDate.toISOString(),
      endTimeIso: endTime.toISOString(),
      timezone: timezoneInput || 'GMT',
      locationType,
      locationPlatform: locationPlatform || null,
      meetingLink: locationType === 'virtual' ? meetingLink || null : null,
      capacity,
      registerLink: registerLink || null,
      category,
    },
  };
}

/** Generates a URL slug for a new event: a title-derived prefix plus a short
 * random suffix for uniqueness (there's no row id yet to derive one from, the
 * way the 055 migration's one-time backfill did). Callers should retry once
 * on a unique-constraint conflict (astronomically unlikely, same pattern as
 * event_registrations.registration_ref). */
export function generateEventSlug(title: string): string {
  const base =
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'event';
  const suffix = randomUUID().replace(/-/g, '').slice(0, 8);
  return `${base}-${suffix}`;
}

export type ResolveEventImageResult = { ok: true; url: string | null } | { ok: false; message: string };

/** Resolves the final image_url for a create/update: prefers an uploaded file
 * (formData.imageFile) over a pasted URL (formData.imageUrl). Uploads go to
 * the public event-images bucket under the uploader's own folder, matching
 * that bucket's per-uploader-folder RLS policy (migration 053_events.sql):
 * `(storage.foldername(name))[1] = auth.uid()::text`. Works for both partner
 * and admin callers since both are real auth.users rows with a real
 * auth.uid() -- must be called with a client carrying that user's own
 * session (createPartnerClient / createUserClient(adminToken)), not the
 * service role, or the folder resolves to the wrong id. */
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
