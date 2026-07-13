'use server';

import { revalidatePath } from 'next/cache';

import { createPartnerClient } from '@/lib/supabase-server';
import { requirePartnerSession } from '@/lib/partner-session';

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
