import { randomUUID } from 'crypto';

import { createServiceRoleClient } from '@/lib/supabase-server';
import { RESERVED_PARTNER_SLUGS, slugifyOrgName } from '@/lib/partner-slugs';
import type { Partner } from '@/lib/partner-session';

const MAX_SLUG_ATTEMPTS = 10;

/**
 * Creates (or returns the existing) `partners` row for a just-verified auth
 * user. Runs on the service-role client only -- partner rows are never
 * inserted from a client-supplied session, matching the trust model in
 * migration 048 (originally admin-only via scripts/create-partner.mjs, now
 * also reachable via the user's own verified self-signup).
 */
export async function provisionPartner(userId: string, email: string, orgName: string): Promise<Partner> {
  const service = createServiceRoleClient();

  const existing = await service
    .from('partners')
    .select('id, org_name, slug, logo_url, contact_email, ref_code, is_active')
    .eq('auth_user_id', userId)
    .maybeSingle();

  if (existing.data) return existing.data;

  const baseSlug = slugifyOrgName(orgName) || 'partner';
  const refCode = randomUUID().slice(0, 8);

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    if (RESERVED_PARTNER_SLUGS.has(slug)) continue;

    const { data, error } = await service
      .from('partners')
      .insert({
        org_name: orgName,
        slug,
        contact_email: email,
        ref_code: refCode,
        auth_user_id: userId,
      })
      .select('id, org_name, slug, logo_url, contact_email, ref_code, is_active')
      .single();

    if (!error && data) return data;

    // Unique violation on slug -- try the next candidate. Any other error is fatal.
    if (error?.code !== '23505') {
      lastError = new Error(error?.message ?? 'Failed to create partner');
      break;
    }
  }

  throw lastError ?? new Error('Could not generate a unique partner slug');
}
