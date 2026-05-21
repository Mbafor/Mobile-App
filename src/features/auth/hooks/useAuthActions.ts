import { useCallback, useState } from 'react';

import { env } from '@/config/env';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { signInWithAppleNative, signInWithOAuthProvider } from '@/features/auth/utils/oauth';
import { authApi, profilesApi } from '@/services/api';
import { queryClient } from '@/store/query-client';
import { parseSupabaseError } from '@/utils/errors';
import { profileNeedsOnboarding } from '@/utils/profile/onboarding-status';

function mapAuthError(e: unknown): string {
  const message = e instanceof Error ? e.message : parseSupabaseError(e as Error).message;
  if (message.includes('Failed to fetch') || message.includes('ERR_NAME_NOT_RESOLVED')) {
    if (env.configError) return env.configError;
    return `${message} — Check EXPO_PUBLIC_SUPABASE_URL in .env and restart Expo with: npx expo start -c`;
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
        const { data, error } = await authApi.verifyEmailOtp(normalized, code);
        if (error) throw error;
        if (!data.session) {
          throw new Error('Verification succeeded but no session was returned.');
        }

        const userId = data.session.user.id;
        await profilesApi.ensureProfile(userId, normalized);
        const { data: profile } = await profilesApi.getByUserId(userId);
        if (!profile || profileNeedsOnboarding(profile)) {
          await profilesApi.markOnboardingIncomplete(userId);
        }

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
        if (!session?.user) throw new Error('Google sign-in did not return a session.');
        const userId = session.user.id;
        const email = session.user.email ?? undefined;
        await profilesApi.ensureProfile(userId, email);
        const { data: profile } = await profilesApi.getByUserId(userId);
        if (!profile || profileNeedsOnboarding(profile)) {
          await profilesApi.markOnboardingIncomplete(userId);
        }
        const oauthAvatar = session.user.user_metadata?.avatar_url;
        if (typeof oauthAvatar === 'string' && oauthAvatar && !profile?.avatarUrl) {
          await profilesApi.updateAvatarUrl(userId, oauthAvatar);
        }
        return session;
      }),
    [run],
  );

  const signInWithApple = useCallback(
    () =>
      run(async () => {
        const session = await signInWithAppleNative();
        if (!session?.user) throw new Error('Apple sign-in did not return a session.');
        const userId = session.user.id;
        const email = session.user.email ?? undefined;
        await profilesApi.ensureProfile(userId, email);
        const { data: profile } = await profilesApi.getByUserId(userId);
        if (!profile || profileNeedsOnboarding(profile)) {
          await profilesApi.markOnboardingIncomplete(userId);
        }
        return session;
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
