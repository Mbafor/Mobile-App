import { useCallback, useState } from 'react';

import { env } from '@/config/env';
import { applyAuthSession } from '@/features/auth/utils/apply-auth-session';
import { signInWithAppleNative, signInWithOAuthProvider } from '@/features/auth/utils/oauth';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { authApi } from '@/services/api';
import { queryClient } from '@/store/query-client';
import { parseSupabaseError } from '@/utils/errors';

function mapAuthError(e: unknown): string {
  const message = e instanceof Error ? e.message : parseSupabaseError(e as Error).message;
  if (message.includes('Failed to fetch') || message.includes('ERR_NAME_NOT_RESOLVED')) {
    if (env.configError) return env.configError;
    return `${message} — Check EXPO_PUBLIC_SUPABASE_URL in .env and restart Expo with: npx expo start -c`;
  }
  if (message.toLowerCase().includes('token') && message.toLowerCase().includes('invalid')) {
    return 'Invalid or expired code. Request a new 6-digit code and try again.';
  }
  if (
    message.includes('Error sending confirmation email') ||
    message.includes('unexpected_failure')
  ) {
    return 'We could not send the login code. In Supabase → Authentication → Email, enable Email OTP and configure SMTP (or the built-in mailer).';
  }
  if (message.includes('redirect_uri_mismatch')) {
    return 'Google sign-in redirect mismatch. Add your app redirect URL in Supabase → Authentication → URL Configuration (see docs/SUPABASE_AUTH_SETUP.md).';
  }
  return message;
}

export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    if (env.configError) {
      setError(env.configError);
      setIsLoading(false);
      return null;
    }
    try {
      return await fn();
    } catch (e) {
      setError(mapAuthError(e));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendEmailOtp = useCallback(
    (email: string) =>
      run(async () => {
        const normalized = email.trim().toLowerCase();
        const { error } = await authApi.signInWithOtp(normalized, { shouldCreateUser: true });
        if (error) throw error;
        return true;
      }),
    [run],
  );

  const verifyEmailOtp = useCallback(
    (email: string, code: string) =>
      run(async () => {
        const normalized = email.trim().toLowerCase();
        const token = code.replace(/\D/g, '').trim();
        if (token.length !== 6) {
          throw new Error('Enter the 6-digit code from your email.');
        }

        const { data, error } = await authApi.verifyEmailOtp(normalized, token);
        if (error) throw error;
        if (!data.session) {
          throw new Error('Verification succeeded but no session was returned.');
        }

        await applyAuthSession(data.session);
        return data;
      }),
    [run],
  );

  const signOut = useCallback(
    () =>
      run(async () => {
        const { error } = await authApi.signOut();
        if (error) throw error;
        queryClient.clear();
        useAuthStore.getState().reset();
        return true;
      }),
    [run],
  );

  const signInWithGoogle = useCallback(
    () =>
      run(async () => {
        const session = await signInWithOAuthProvider('google');
        // Web: browser navigates away; /auth/callback completes sign-in.
        if (session === null) return true;
        if (!session.user) throw new Error('Google sign-in did not return a session.');
        return true;
      }),
    [run],
  );

  const signInWithApple = useCallback(
    () =>
      run(async () => {
        const session = await signInWithAppleNative();
        if (session === null) return true;
        if (!session.user) throw new Error('Apple sign-in did not return a session.');
        return true;
      }),
    [run],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    clearError,
    sendEmailOtp,
    verifyEmailOtp,
    signOut,
    signInWithGoogle,
    signInWithApple,
  };
}
