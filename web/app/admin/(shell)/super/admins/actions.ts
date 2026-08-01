'use server';

import { revalidatePath } from 'next/cache';

import { requireSuperAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';

export type SuperAdminMutationResult = { ok: true } | { ok: false; message: string };

/** Grants opportunity-admin access to an existing user by email --
 * super_admin_promote_admin_by_email (024_super_admin_management_fixes.sql)
 * requires the user to already have an account. */
export async function promoteAdminByEmail(email: string): Promise<SuperAdminMutationResult> {
  const session = await requireSuperAdminSession();
  const client = createUserClient(session.accessToken);

  const { error } = await client.rpc('super_admin_promote_admin_by_email', {
    p_email: email,
    p_is_admin: true,
  });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/super/admins');
  return { ok: true };
}

export async function revokeAdmin(userId: string): Promise<SuperAdminMutationResult> {
  const session = await requireSuperAdminSession();
  const client = createUserClient(session.accessToken);

  const { error } = await client.rpc('super_admin_set_admin', {
    p_user_id: userId,
    p_is_admin: false,
  });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/super/admins');
  return { ok: true };
}
