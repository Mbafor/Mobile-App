'use server';

import { revalidatePath } from 'next/cache';

import { requirePartnerSession } from '@/lib/partner-session';
import { createAnonClient, createPartnerClient, createServiceRoleClient } from '@/lib/supabase-server';

export type CreateOpportunityResult = { ok: true } | { ok: false; message: string };

function parseDeadline(dateInput: string): string | null {
  const trimmed = dateInput.trim();
  if (!trimmed) return null;
  const parsed = new Date(`${trimmed}T23:59:59.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export async function createPartnerOpportunity(formData: FormData): Promise<CreateOpportunityResult> {
  const session = await requirePartnerSession();

  const title = String(formData.get('title') ?? '').trim();
  const organization = String(formData.get('organization') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  const applyUrl = String(formData.get('applyUrl') ?? '').trim();
  const deadlineInput = String(formData.get('deadline') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const country = String(formData.get('country') ?? '').trim();
  const fundingType = String(formData.get('fundingType') ?? '').trim();
  const locationType = String(formData.get('locationType') ?? '').trim();
  const tags = formData.getAll('tags').map((t) => String(t).trim()).filter(Boolean);
  const degreeLevels = formData.getAll('degreeLevels').map((d) => String(d).trim()).filter(Boolean);

  if (!title || !organization || !deadlineInput) {
    return { ok: false, message: 'Title, organization, and deadline are required.' };
  }
  if (!category) {
    return { ok: false, message: 'Please select a category.' };
  }
  if (!country) {
    return { ok: false, message: 'Please select a country.' };
  }

  const tagSet = new Set(tags);
  tagSet.add(category);
  if (tagSet.size === 0) {
    return { ok: false, message: 'Please select at least one tag.' };
  }

  if (degreeLevels.length === 0) {
    return { ok: false, message: 'Please select at least one degree level.' };
  }
  if (!locationType) {
    return { ok: false, message: 'Please select a location type.' };
  }
  if (!fundingType || fundingType === 'any') {
    return { ok: false, message: 'Please select a funding type.' };
  }

  const deadlineIso = parseDeadline(deadlineInput);
  if (!deadlineIso) {
    return { ok: false, message: 'Enter a valid deadline date.' };
  }
  if (new Date(deadlineIso).getTime() <= Date.now()) {
    return { ok: false, message: 'Deadline must be in the future so students can see this listing.' };
  }

  const { data: userData } = await createAnonClient().auth.getUser(session.accessToken);

  const { data: inserted, error: insertError } = await createServiceRoleClient()
    .from('opportunities')
    .insert({
      title,
      organization,
      description: description || null,
      image_url: imageUrl || null,
      apply_url: applyUrl || null,
      deadline: deadlineIso,
      tags: [...tagSet],
      country,
      category,
      funding_type: fundingType,
      degree_levels: degreeLevels,
      location_type: locationType,
      status: 'approved',
      is_active: true,
      source: 'partner',
      created_by: userData.user?.id ?? null,
    })
    .select('id')
    .single();

  if (insertError || !inserted) {
    return { ok: false, message: insertError?.message ?? 'Could not create the opportunity.' };
  }

  const { error: postError } = await createPartnerClient(session.accessToken)
    .from('partner_posts')
    .insert({ partner_id: session.partner.id, opportunity_id: inserted.id, digest_slug: null });

  if (postError) {
    return { ok: false, message: postError.message };
  }

  revalidatePath('/partner/dashboard');
  revalidatePath('/partner/dashboard/browse');
  revalidatePath(`/partner/${session.partner.slug}`);

  return { ok: true };
}
