'use server';

import { randomBytes, randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';

import { requireSuperAdminSession } from '@/lib/admin-session';
import { createServiceRoleClient, createUserClient } from '@/lib/supabase-server';
import { RESERVED_PARTNER_SLUGS, slugifyOrgName } from '@/lib/partner-slugs';

export type SuperAdminMutationResult = { ok: true } | { ok: false; message: string };
export type CreatePartnerResult =
  | { ok: true; tempPassword: string; slug: string }
  | { ok: false; message: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_SLUG_ATTEMPTS = 10;

function generateTempPassword(): string {
  // 18 random bytes -> 24-char base64url string; well past any reasonable
  // minimum-length policy, no characters that need escaping when displayed/copied.
  return randomBytes(18).toString('base64url');
}

/** Creates a partner directly from the Super Admin UI -- the manual-invite
 * counterpart to self-signup (partner/signup/actions.ts -> provisionPartner)
 * and to the old scripts/create-partner.mjs CLI script, which this
 * supersedes for day-to-day use. Needs the Auth Admin API (create a real
 * auth.users row with a password) which only the service-role client can
 * reach -- Postgres has no access to it, so unlike the rest of this file
 * there is no RPC backing this action. */
export async function createPartner(formData: FormData): Promise<CreatePartnerResult> {
  await requireSuperAdminSession();

  const orgName = String(formData.get('orgName') ?? '').trim();
  const contactEmail = String(formData.get('contactEmail') ?? '').trim().toLowerCase();
  const requestedSlug = String(formData.get('slug') ?? '').trim();

  if (!orgName) return { ok: false, message: 'Organization name is required.' };
  if (!contactEmail || !EMAIL_REGEX.test(contactEmail)) {
    return { ok: false, message: 'Enter a valid contact email.' };
  }

  const baseSlug = slugifyOrgName(requestedSlug || orgName) || 'partner';
  if (RESERVED_PARTNER_SLUGS.has(baseSlug)) {
    return { ok: false, message: `"${baseSlug}" is a reserved slug -- pick a different name.` };
  }

  const service = createServiceRoleClient();
  const tempPassword = generateTempPassword();

  const { data: userData, error: userError } = await service.auth.admin.createUser({
    email: contactEmail,
    password: tempPassword,
    email_confirm: true,
  });

  if (userError || !userData.user) {
    const message = userError?.message ?? 'Could not create the partner account.';
    return { ok: false, message: /already been registered|already registered/i.test(message)
      ? 'A user with this email already exists.'
      : message };
  }

  let lastError: string | null = null;
  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    if (RESERVED_PARTNER_SLUGS.has(slug)) continue;

    const { error } = await service.from('partners').insert({
      org_name: orgName,
      slug,
      contact_email: contactEmail,
      ref_code: randomUUID().slice(0, 8),
      auth_user_id: userData.user.id,
    });

    if (!error) {
      revalidatePath('/admin/super/partners');
      return { ok: true, tempPassword, slug };
    }

    if (error.code !== '23505') {
      lastError = error.message;
      break;
    }
  }

  // The auth user now exists without a partners row -- surface that clearly
  // rather than silently leaving an orphaned account (same tradeoff the CLI
  // script makes; auto-cleanup here would itself be another failure point).
  return {
    ok: false,
    message: `Account was created but the partner profile could not be saved (${lastError ?? 'unknown error'}). The auth user (${contactEmail}) now exists without a partner record -- remove it manually from Supabase Auth before retrying.`,
  };
}

export async function updatePartner(partnerId: string, formData: FormData): Promise<SuperAdminMutationResult> {
  const session = await requireSuperAdminSession();
  const client = createUserClient(session.accessToken);

  const orgName = String(formData.get('orgName') ?? '').trim();
  const contactEmail = String(formData.get('contactEmail') ?? '').trim();
  const logoUrl = String(formData.get('logoUrl') ?? '').trim();

  const { error } = await client.rpc('super_admin_update_partner', {
    p_partner_id: partnerId,
    p_org_name: orgName,
    p_contact_email: contactEmail,
    p_logo_url: logoUrl || null,
  });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/super/partners');
  return { ok: true };
}

export async function setPartnerActive(partnerId: string, isActive: boolean): Promise<SuperAdminMutationResult> {
  const session = await requireSuperAdminSession();
  const client = createUserClient(session.accessToken);

  const { error } = await client.rpc('super_admin_set_partner_active', {
    p_partner_id: partnerId,
    p_is_active: isActive,
  });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/super/partners');
  return { ok: true };
}
