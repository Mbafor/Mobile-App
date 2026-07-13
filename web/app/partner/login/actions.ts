'use server';

import { redirect } from 'next/navigation';

import { createAnonClient } from '@/lib/supabase-server';
import { clearSessionCookies, writeSessionCookies } from '@/lib/partner-session';

export async function partnerLogin(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    redirect('/partner/login?error=missing_fields');
  }

  const anon = createAnonClient();
  const { data, error } = await anon.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    redirect('/partner/login?error=invalid_credentials');
  }

  await writeSessionCookies(data.session.access_token, data.session.refresh_token);
  redirect('/partner/dashboard');
}

export async function partnerLogout() {
  await clearSessionCookies();
  redirect('/partner/login');
}
