'use server';

import { revalidatePath } from 'next/cache';

import { requirePartnerSession } from '@/lib/partner-session';
import { createAnonClient, createPartnerClient, createServiceRoleClient } from '@/lib/supabase-server';
import { parsePartnerOpportunityForm } from '@/lib/partner-opportunity-form';

export type CreateOpportunityResult = { ok: true } | { ok: false; message: string };

export async function createPartnerOpportunity(formData: FormData): Promise<CreateOpportunityResult> {
  const session = await requirePartnerSession();

  const parsed = parsePartnerOpportunityForm(formData);
  if (!parsed.ok) return parsed;
  const data = parsed.data;

  const { data: userData } = await createAnonClient().auth.getUser(session.accessToken);

  const { data: inserted, error: insertError } = await createServiceRoleClient()
    .from('opportunities')
    .insert({
      title: data.title,
      organization: data.organization,
      description: data.description,
      image_url: data.imageUrl,
      apply_url: data.applyUrl,
      deadline: data.deadlineIso,
      tags: data.tags,
      country: data.country,
      category: data.category,
      funding_type: data.fundingType,
      degree_levels: data.degreeLevels,
      location_type: data.locationType,
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
