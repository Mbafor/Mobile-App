import type { AuthChangeEvent, AuthError, Session } from '@supabase/supabase-js';

import type { OAuthProvider } from '@/features/auth/types';
import { supabase } from '@/services/supabase/client';

export type OtpVerificationType = 'signup' | 'email';

/** Supabase Auth — email/password + OTP verification, OAuth, sessions. */
export const authApi = {
  getSession: () => supabase.auth.getSession(),

  signUpWithPassword: (email: string, password: string, metadata?: Record<string, unknown>) =>
    supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: metadata ? { data: metadata } : undefined,
    }),

  signInWithPassword: (email: string, password: string) =>
    supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    }),

  /** Legacy / fallback: magic OTP without password (existing accounts). */
  signInWithOtp: (email: string, options?: { shouldCreateUser?: boolean }) =>
    supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: options?.shouldCreateUser ?? false,
      },
    }),

  resendSignupConfirmation: (email: string) =>
    supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    }),

  verifyEmailOtp: (email: string, token: string, type: OtpVerificationType = 'signup') =>
    supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type,
    }),

  updateUserMetadata: (data: Record<string, unknown>) =>
    supabase.auth.updateUser({ data }),

  signOut: () => supabase.auth.signOut(),

  signInWithOAuth: (
    provider: OAuthProvider,
    redirectTo: string,
    skipBrowserRedirect = true,
  ) =>
    supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect },
    }),

  signInWithAppleIdToken: (identityToken: string) =>
    supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: identityToken,
    }),

  exchangeCodeForSession: (code: string) => supabase.auth.exchangeCodeForSession(code),

  setSession: (tokens: { access_token: string; refresh_token: string }) =>
    supabase.auth.setSession(tokens),

  onAuthStateChange: (
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ) => supabase.auth.onAuthStateChange(callback),

  deleteAccount: () => supabase.rpc('delete_own_account'),
};

export type { AuthError, Session };
