'use server';

import { revalidatePath } from 'next/cache';

import { createPartnerClient } from '@/lib/supabase-server';
import { requirePartnerSession } from '@/lib/partner-session';
import { parsePartnerOpportunityForm } from '@/lib/partner-opportunity-form';

export type PartnerOpportunityMutationResult = { ok: true } | { ok: false; message: string };

/** Updates an opportunity the partner posted themselves. RLS (see migration
 * 050_partner_manage_own_opportunities.sql) enforces ownership at the database
 * layer, so a 0-row result here just as easily means "not yours" as "not found". */
export async function updatePartnerOpportunity(
  opportunityId: string,
  formData: FormData,
): Promise<PartnerOpportunityMutationResult> {
  const session = await requirePartnerSession();

  const parsed = parsePartnerOpportunityForm(formData);
  if (!parsed.ok) return parsed;
  const data = parsed.data;

  const client = createPartnerClient(session.accessToken);
  const { data: updated, error } = await client
    .from('opportunities')
    .update({
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
    })
    .eq('id', opportunityId)
    .select('id')
    .maybeSingle();

  if (error) return { ok: false, message: error.message };
  if (!updated) return { ok: false, message: 'Opportunity not found or no longer yours to edit.' };

  revalidatePath('/partner/dashboard');
  revalidatePath(`/partner/dashboard/${opportunityId}/edit`);
  revalidatePath(`/partner/${session.partner.slug}`);

  return { ok: true };
}

/** Deletes an opportunity the partner posted themselves. partner_posts rows for it
 * cascade-delete automatically (on delete cascade, see 048_partner_program.sql). */
export async function deletePartnerOpportunity(opportunityId: string): Promise<PartnerOpportunityMutationResult> {
  const session = await requirePartnerSession();
  const client = createPartnerClient(session.accessToken);

  const { error, count } = await client
    .from('opportunities')
    .delete({ count: 'exact' })
    .eq('id', opportunityId);

  if (error) return { ok: false, message: error.message };
  if (!count) return { ok: false, message: 'Opportunity not found or no longer yours to delete.' };

  revalidatePath('/partner/dashboard');
  revalidatePath('/partner/dashboard/browse');
  revalidatePath(`/partner/${session.partner.slug}`);

  return { ok: true };
}

function buildDigestSlug(): string {
  const date = new Date().toISOString().slice(0, 10);
  const random = Math.random().toString(36).slice(2, 6);
  return `${date}-${random}`;
}

/** Publishes the partner's own curated set of opportunities as this week's digest --
 * reuses partner_posts (grouped by a fresh digest_slug) so these opportunities also
 * show up on the partner's own public page and post count. */
export async function publishPartnerDigest(opportunityIds: string[]): Promise<{ slug: string } | null> {
  if (opportunityIds.length === 0) return null;

  const session = await requirePartnerSession();
  const client = createPartnerClient(session.accessToken);
  const digestSlug = buildDigestSlug();

  const rows = opportunityIds.map((opportunityId) => ({
    partner_id: session.partner.id,
    opportunity_id: opportunityId,
    digest_slug: digestSlug,
  }));

  const { error } = await client
    .from('partner_posts')
    .upsert(rows, { onConflict: 'partner_id,opportunity_id', ignoreDuplicates: true });

  if (error) throw new Error(error.message);

  revalidatePath('/partner/dashboard');
  revalidatePath('/partner/dashboard/digest');
  revalidatePath(`/partner/${session.partner.slug}`);

  return { slug: digestSlug };
}
