'use server';

import { redirect } from 'next/navigation';

import { createAnonClient, createUserClient } from '@/lib/supabase-server';
import { clearAdminSessionCookies, writeAdminSessionCookies } from '@/lib/admin-session';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://voila-africa.com').replace(/\/$/, '');

/** Starts the Google OAuth flow for admins who signed up via Google in the
 * mobile app -- same Supabase Auth project/provider, so it's the exact same
 * account either way (same auth.users row, same profiles.is_admin flag).
 * Done entirely server-side: ask Supabase for the provider consent URL
 * (skipBrowserRedirect so it returns the URL instead of trying to redirect a
 * response that doesn't exist yet), then redirect() the browser to it --
 * next/navigation's redirect() works for external URLs too, so no
 * client-side Supabase instance is needed. */
export async function adminLoginWithGoogle() {
  const anon = createAnonClient();
  const { data, error } = await anon.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${SITE_URL}/admin/auth/callback`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    redirect('/admin/login?error=oauth_failed');
  }

  redirect(data.url);
}

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
