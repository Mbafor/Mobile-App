'use server';

import { redirect } from 'next/navigation';

import { createAnonClient } from '@/lib/supabase-server';
import { writeSessionCookies } from '@/lib/partner-session';
import { provisionPartner } from '@/lib/partner-provisioning';

function buildQuery(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

export async function verifyPartnerOtp(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const org = String(formData.get('org') || '').trim();
  const code = String(formData.get('code') || '').replace(/\D/g, '');

  if (!email || !org || code.length !== 6) {
    redirect(`/partner/verify-otp?${buildQuery({ error: 'invalid_code', email, org })}`);
  }

  const anon = createAnonClient();

  // Supabase may issue either OTP type depending on project config -- try
  // 'signup' first, then fall back to 'email', mirroring the mobile app's
  // verifyEmailOtp (src/features/auth/hooks/useAuthActions.ts).
  const types: Array<'signup' | 'email'> = ['signup', 'email'];
  let session: { access_token: string; refresh_token: string } | null = null;
  let userId: string | null = null;

  for (const type of types) {
    const { data, error } = await anon.auth.verifyOtp({ email, token: code, type });
    if (!error && data.session) {
      session = data.session;
      userId = data.session.user.id;
      break;
    }
  }

  if (!session || !userId) {
    redirect(`/partner/verify-otp?${buildQuery({ error: 'invalid_code', email, org })}`);
  }

  const partner = await provisionPartner(userId, email, org);
  if (!partner.is_active) {
    redirect(`/partner/verify-otp?${buildQuery({ error: 'account_disabled', email, org })}`);
  }

  await writeSessionCookies(session.access_token, session.refresh_token);
  redirect('/partner/dashboard');
}

export async function resendPartnerOtp(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const org = String(formData.get('org') || '').trim();

  if (email) {
    const anon = createAnonClient();
    await anon.auth.resend({ type: 'signup', email });
  }

  redirect(`/partner/verify-otp?${buildQuery({ email, org, resent: '1' })}`);
}
