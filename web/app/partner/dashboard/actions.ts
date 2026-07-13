'use server';

import { revalidatePath } from 'next/cache';

import { createPartnerClient } from '@/lib/supabase-server';
import { requirePartnerSession } from '@/lib/partner-session';

function buildDigestSlug(): string {
  const date = new Date().toISOString().slice(0, 10);
  const random = Math.random().toString(36).slice(2, 6);
  return `${date}-${random}`;
}

export async function postOpportunities(opportunityIds: string[]) {
  if (opportunityIds.length === 0) return { posted: 0 };

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
  revalidatePath(`/partner/${session.partner.slug}`);

  return { posted: opportunityIds.length };
}

/** Records that a partner shared the admin-curated weekly digest -- reuses partner_posts so
 * these opportunities also show up on the partner's own public page and post count. */
export async function shareAdminDigest(opportunityIds: string[], digestSlug: string) {
  if (opportunityIds.length === 0) return { posted: 0 };

  const session = await requirePartnerSession();
  const client = createPartnerClient(session.accessToken);

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
  revalidatePath(`/partner/${session.partner.slug}`);

  return { posted: opportunityIds.length };
}
