import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { mapToUserProfile } from '@/services/api/mappers/profile.mapper';
import { sendWelcomeEmailIfNeeded } from '@/features/notifications/services/send-welcome-email';
import { profilesApi, userPreferencesApi } from '@/services/api';
import { queryKeys } from '@/constants/query-keys';
import type {
  OnboardingAcademicInfo,
  OnboardingBasicInfo,
  OnboardingOpportunityPrefs,
} from '@/types/domain/onboarding';
import { parseSupabaseError } from '@/utils/errors';
import { hasCompletedOnboardingFields } from '@/utils/profile/onboarding-status';

export function useOnboardingActions() {
  const { user, profile: authProfile } = useAuth();
  const setProfile = useAuthStore((s) => s.setProfile);
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;
  const email = user?.email ?? authProfile?.email;

  const invalidate = useCallback(async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile(userId) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.preferences(userId) });
  }, [queryClient, userId]);

  const refreshAuthProfile = useCallback(
    async () => {
      if (!userId) throw new Error('Not signed in');
      const { data, error: profileError } = await profilesApi.getByUserId(userId);
      if (profileError) throw profileError;
      if (!data) throw new Error('Could not load your profile. Please try again.');
      const nextProfile = mapToUserProfile(data, email ?? '');
      setProfile(nextProfile);
      return nextProfile;
    },
    [email, setProfile, userId],
  );

  const run = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (e) {
      const message = e instanceof Error ? e.message : parseSupabaseError(e as Error).message;
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveBasicInfo = useCallback(
    (info: OnboardingBasicInfo) =>
      run(async () => {
        if (!userId) throw new Error('Not signed in');
        const { error } = await profilesApi.saveBasicInfo(userId, email, info);
        if (error) throw error;
        await invalidate();
        return true;
      }),
    [email, invalidate, run, userId],
  );

  const saveAcademicInfo = useCallback(
    (info: OnboardingAcademicInfo) =>
      run(async () => {
        if (!userId) throw new Error('Not signed in');
        const { error } = await profilesApi.saveAcademicInfo(userId, info);
        if (error) throw error;
        await invalidate();
        return true;
      }),
    [invalidate, run, userId],
  );

  const completeOnboarding = useCallback(
    (prefs: OnboardingOpportunityPrefs) =>
      run(async () => {
        if (!userId) throw new Error('Not signed in');

        const { data: currentProfile, error: profileFetchError } =
          await profilesApi.getByUserId(userId);
        if (profileFetchError) throw profileFetchError;
        if (!currentProfile || !hasCompletedOnboardingFields(currentProfile)) {
          throw new Error(
            'Please complete basic and academic information before finishing setup.',
          );
        }

        const { error: prefsError } = await userPreferencesApi.saveOpportunityPreferences(
          userId,
          prefs,
        );
        if (prefsError) throw prefsError;

        const { error: completeError } = await profilesApi.markOnboardingComplete(userId);
        if (completeError) throw completeError;

        await invalidate();
        const refreshed = await refreshAuthProfile();
        if (!refreshed.onboardingComplete) {
          throw new Error('Setup could not be confirmed. Please check all required fields.');
        }

        void sendWelcomeEmailIfNeeded(userId, email, currentProfile.fullName);

        return true;
      }),
    [invalidate, refreshAuthProfile, run, userId],
  );

  const saveAllForEdit = useCallback(
    (
      basic: OnboardingBasicInfo,
      academic: OnboardingAcademicInfo,
      prefs: OnboardingOpportunityPrefs,
    ) =>
      run(async () => {
        if (!userId) throw new Error('Not signed in');

        const { error: profileError } = await profilesApi.saveFullProfile(userId, email, {
          ...basic,
          ...academic,
        });
        if (profileError) throw profileError;

        const { error: prefsError } = await userPreferencesApi.saveFullPreferences(userId, prefs);
        if (prefsError) throw prefsError;

        await invalidate();
        await refreshAuthProfile();
        return true;
      }),
    [email, invalidate, refreshAuthProfile, run, userId],
  );

  return {
    isLoading,
    error,
    clearError: () => setError(null),
    saveBasicInfo,
    saveAcademicInfo,
    completeOnboarding,
    saveAllForEdit,
  };
}
