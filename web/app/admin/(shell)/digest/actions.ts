'use server';

import { revalidatePath } from 'next/cache';

import { requireAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';

export type PublishDigestResult = { ok: true } | { ok: false; message: string };

/** Records a digest publish/share: bumps last_sent_at/times_sent for every
 * included opportunity (bump_opportunity_sends, 049_weekly_digest.sql) and logs
 * one sent_digests row per channel -- mirrors weeklyDigestApi.publishDigest in
 * the mobile app (src/services/api/weekly-digest.api.ts). Called once per share
 * button click, so publishing to multiple channels for the same digest logs one
 * row each under the same slug. */
export async function publishAdminDigest(
  opportunityIds: string[],
  channel: string,
  slug: string,
): Promise<PublishDigestResult> {
  const session = await requireAdminSession();
  const client = createUserClient(session.accessToken);

  const { error: bumpError } = await client.rpc('bump_opportunity_sends', { p_ids: opportunityIds });
  if (bumpError) return { ok: false, message: bumpError.message };

  const { error: insertError } = await client.from('sent_digests').insert({
    slug,
    opportunity_ids: opportunityIds,
    channel,
    created_by: session.admin.id,
  });
  if (insertError) return { ok: false, message: insertError.message };

  revalidatePath('/admin/digest');

  return { ok: true };
}
