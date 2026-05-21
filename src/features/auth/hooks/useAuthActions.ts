import { useCallback, useState } from 'react';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { signInWithAppleNative, signInWithOAuthProvider } from '@/features/auth/utils/oauth';
import { authApi, profilesApi } from '@/services/api';
import { parseSupabaseError } from '@/utils/errors';

export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      const message = e instanceof Error ? e.message : parseSupabaseError(e as Error).message;
      setError(message);
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
        const { data: profile } = await profilesApi.getByUserId(userId);
        if (!profile) {
          await profilesApi.ensureProfile(userId, normalized);
          await authApi.updateUserMetadata({ onboarding_complete: false });
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
        await profilesApi.ensureProfile(session.user.id, session.user.email ?? undefined);
        return session;
      }),
    [run],
  );

  const signInWithApple = useCallback(
    () =>
      run(async () => {
        const session = await signInWithAppleNative();
        if (!session?.user) throw new Error('Apple sign-in did not return a session.');
        await profilesApi.ensureProfile(session.user.id, session.user.email ?? undefined);
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
