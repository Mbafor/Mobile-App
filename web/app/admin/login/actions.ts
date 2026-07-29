'use server';

import { redirect } from 'next/navigation';

import { createAnonClient, createUserClient } from '@/lib/supabase-server';
import { clearAdminSessionCookies, writeAdminSessionCookies } from '@/lib/admin-session';

export async function adminLogin(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    redirect('/admin/login?error=missing_fields');
  }

  const anon = createAnonClient();
  const { data, error } = await anon.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    redirect('/admin/login?error=invalid_credentials');
  }

  const { data: profile } = await createUserClient(data.session.access_token)
    .from('profiles')
    .select('is_admin, is_super_admin')
    .maybeSingle();

  if (!profile?.is_admin && !profile?.is_super_admin) {
    redirect('/admin/login?error=not_admin');
  }

  await writeAdminSessionCookies(data.session.access_token, data.session.refresh_token);
  redirect('/admin/events');
}

export async function adminLogout() {
  await clearAdminSessionCookies();
  redirect('/admin/login');
}
