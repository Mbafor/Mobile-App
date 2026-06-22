import { useCallback, useState } from 'react';

import { env } from '@/config/env';
import { applyAuthSession } from '@/features/auth/utils/apply-auth-session';
import {
  signInWithAppleNative,
  signInWithOAuthProvider,
  getPasswordResetRedirectUri,
} from '@/features/auth/utils/oauth';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { authApi, type OtpVerificationType } from '@/services/api';
import { profilesApi } from '@/services/api';
import { queryClient } from '@/store/query-client';
import { parseSupabaseError } from '@/utils/errors';
import { isValidPassword } from '@/utils/validation';

export type EmailPasswordSignInResult =
  | { needsOtp: false }
  | { needsOtp: true; otpType: OtpVerificationType };

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
    return 'We could not send the login code. In Supabase → Authentication → Email, enable Email confirmations with OTP and configure SMTP.';
  }
  if (message.includes('redirect_uri_mismatch')) {
    return 'Google sign-in redirect mismatch. Add your app redirect URL in Supabase → Authentication → URL Configuration (see docs/SUPABASE_AUTH_SETUP.md).';
  }
  if (message.toLowerCase().includes('user already registered')) {
    return 'An account with this email already exists.';
  }
  return message;
}

function isEmailNotConfirmed(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('email not confirmed') ||
    lower.includes('email not verified') ||
    lower.includes('confirm your email')
  );
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

  const signInWithEmailPassword = useCallback(
    (email: string, password: string) =>
      run(async (): Promise<EmailPasswordSignInResult | null> => {
        const normalized = email.trim().toLowerCase();
        if (!isValidPassword(password)) {
          throw new Error('Password must be at least 8 characters.');
        }

        const signIn = await authApi.signInWithPassword(normalized, password);

        if (!signIn.error && signIn.data.session) {
          await applyAuthSession(signIn.data.session);
          await profilesApi.syncEmailFromAuth(normalized);
          return { needsOtp: false };
        }

        if (signIn.error && isEmailNotConfirmed(signIn.error.message)) {
          const { error: resendError } = await authApi.resendSignupConfirmation(normalized);
          if (resendError) throw resendError;
          return { needsOtp: true, otpType: 'signup' };
        }

        // Probe sign-up to distinguish wrong password (account exists) vs no account
        const signUp = await authApi.signUpWithPassword(normalized, password);

        if (signUp.error) {
          const msg = signUp.error.message.toLowerCase();
          if (msg.includes('already registered') || msg.includes('already been registered')) {
            throw new Error('Wrong password. Reset your password to continue.');
          }
          throw signUp.error;
        }

        // Sign-up succeeded → no account existed with this email
        throw new Error('No account found. Create your account to get started.');
      }),
    [run],
  );

  const verifyEmailOtp = useCallback(
    (email: string, code: string, otpType: OtpVerificationType = 'signup') =>
      run(async () => {
        const normalized = email.trim().toLowerCase();
        const token = code.replace(/\D/g, '').trim();
        if (token.length !== 6) {
          throw new Error('Enter the 6-digit code from your email.');
        }

        const types: OtpVerificationType[] =
          otpType === 'signup' ? ['signup', 'email'] : ['email', 'signup'];

        let lastError: Error | null = null;
        for (const type of types) {
          const { data, error } = await authApi.verifyEmailOtp(normalized, token, type);
          if (!error && data.session) {
            await applyAuthSession(data.session);
            await profilesApi.syncEmailFromAuth(normalized);
            return data;
          }
          lastError = error ?? new Error('Verification failed.');
        }

        throw lastError ?? new Error('Invalid or expired code.');
      }),
    [run],
  );

  const resendEmailOtp = useCallback(
    (email: string, otpType: OtpVerificationType = 'signup') =>
      run(async () => {
        const normalized = email.trim().toLowerCase();
        if (otpType === 'signup') {
          const { error } = await authApi.resendSignupConfirmation(normalized);
          if (error) throw error;
        } else {
          const { error } = await authApi.signInWithOtp(normalized, { shouldCreateUser: false });
          if (error) throw error;
        }
        return true;
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

  const signUpWithEmailPasswordAndName = useCallback(
    (name: string, email: string, password: string) =>
      run(async (): Promise<EmailPasswordSignInResult | null> => {
        const normalized = email.trim().toLowerCase();
        if (!isValidPassword(password)) {
          throw new Error('Password must be at least 8 characters.');
        }
        const { data, error } = await authApi.signUpWithPassword(normalized, password, {
          full_name: name.trim(),
        });
        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('already registered') || msg.includes('already been registered')) {
            return { accountExists: true as const };
          }
          throw error;
        }
        if (data.session) {
          await applyAuthSession(data.session);
          await profilesApi.syncEmailFromAuth(normalized);
          return { needsOtp: false };
        }
        return { needsOtp: true, otpType: 'signup' };
      }),
    [run],
  );

  const sendPasswordReset = useCallback(
    (email: string) =>
      run(async () => {
        const normalized = email.trim().toLowerCase();
        const redirectTo = getPasswordResetRedirectUri();
        const { error } = await authApi.resetPasswordForEmail(normalized, redirectTo);
        if (error) throw error;
        return true;
      }),
    [run],
  );

  const updatePassword = useCallback(
    (newPassword: string) =>
      run(async () => {
        if (!isValidPassword(newPassword)) {
          throw new Error('Password must be at least 8 characters.');
        }
        const { error } = await authApi.updatePassword(newPassword);
        if (error) throw error;
        return true;
      }),
    [run],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    clearError,
    signInWithEmailPassword,
    signUpWithEmailPasswordAndName,
    verifyEmailOtp,
    resendEmailOtp,
    signOut,
    signInWithGoogle,
    signInWithApple,
    sendPasswordReset,
    updatePassword,
  };
}
