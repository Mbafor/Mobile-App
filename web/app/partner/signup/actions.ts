'use server';

import { redirect } from 'next/navigation';

import { createAnonClient } from '@/lib/supabase-server';
import { writeSessionCookies } from '@/lib/partner-session';
import { provisionPartner } from '@/lib/partner-provisioning';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export async function partnerSignup(formData: FormData) {
  const org = String(formData.get('org') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!org || !email || !password || !confirmPassword) {
    redirect(`/partner/signup?error=missing_fields&org=${encodeURIComponent(org)}&email=${encodeURIComponent(email)}`);
  }
  if (!EMAIL_REGEX.test(email)) {
    redirect(`/partner/signup?error=invalid_email&org=${encodeURIComponent(org)}`);
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    redirect(`/partner/signup?error=weak_password&org=${encodeURIComponent(org)}&email=${encodeURIComponent(email)}`);
  }
  if (password !== confirmPassword) {
    redirect(`/partner/signup?error=password_mismatch&org=${encodeURIComponent(org)}&email=${encodeURIComponent(email)}`);
  }

  const anon = createAnonClient();
  const { data, error } = await anon.auth.signUp({
    email,
    password,
    options: { data: { full_name: org } },
  });

  if (error) {
    if (/already registered|already been registered/i.test(error.message)) {
      redirect(`/partner/signup?error=already_registered&org=${encodeURIComponent(org)}&email=${encodeURIComponent(email)}`);
    }
    redirect(`/partner/signup?error=signup_failed&org=${encodeURIComponent(org)}&email=${encodeURIComponent(email)}`);
  }

  if (data.session && data.user) {
    const partner = await provisionPartner(data.user.id, email, org);
    if (partner.is_active) {
      await writeSessionCookies(data.session.access_token, data.session.refresh_token);
      redirect('/partner/dashboard');
    }
  }

  redirect(`/partner/verify-otp?email=${encodeURIComponent(email)}&org=${encodeURIComponent(org)}`);
}
