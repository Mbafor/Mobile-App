import type { AuthChangeEvent, AuthError, Session } from '@supabase/supabase-js';

import type { OAuthProvider } from '@/features/auth/types';
import { supabase } from '@/services/supabase/client';

/** Supabase Auth only — OTP, OAuth, sessions. */
export const authApi = {
  getSession: () => supabase.auth.getSession(),

  /** Supabase generates the 6-digit code and sends the email. */
  signInWithOtp: (email: string, options?: { shouldCreateUser?: boolean }) =>
    supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: options?.shouldCreateUser ?? true,
      },
    }),

  verifyEmailOtp: (email: string, token: string) =>
    supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'email',
    }),

  updateUserMetadata: (data: Record<string, unknown>) =>
    supabase.auth.updateUser({ data }),

  signOut: () => supabase.auth.signOut(),

  signInWithOAuth: (provider: OAuthProvider, redirectTo: string) =>
    supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
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
