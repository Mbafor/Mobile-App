'use server';

import { revalidatePath } from 'next/cache';

import { requireSuperAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';

export type SuperAdminMutationResult = { ok: true } | { ok: false; message: string };

/** Creates an already-approved mentor profile for an existing user by email --
 * super_admin_create_mentor_by_email requires the user to already have an account. */
export async function createMentorByEmail(email: string): Promise<SuperAdminMutationResult> {
  const session = await requireSuperAdminSession();
  const client = createUserClient(session.accessToken);

  const { error } = await client.rpc('super_admin_create_mentor_by_email', { p_email: email });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/super/mentors');
  return { ok: true };
}

export async function approveMentor(userId: string): Promise<SuperAdminMutationResult> {
  const session = await requireSuperAdminSession();
  const client = createUserClient(session.accessToken);

  const { error } = await client.rpc('super_admin_approve_mentor', { p_user_id: userId });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/super/mentors');
  return { ok: true };
}

/** Removes a coach profile -- ends active mentorships and cancels pending
 * requests server-side (super_admin_delete_mentor). */
export async function deleteMentor(userId: string): Promise<SuperAdminMutationResult> {
  const session = await requireSuperAdminSession();
  const client = createUserClient(session.accessToken);

  const { error } = await client.rpc('super_admin_delete_mentor', { p_user_id: userId });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/super/mentors');
  return { ok: true };
}
