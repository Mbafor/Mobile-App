import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { ROUTES } from '@/constants/routes';
import {
  getOnboardingStepIndex,
  getRequiredOnboardingRoute,
  getRequiredOnboardingStep,
  ONBOARDING_STEP_ORDER,
  type OnboardingStep,
} from '@/utils/profile/onboarding-status';

export function useOnboardingGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isAuthReady, onboardingComplete } = useAuth();
  const { profile, isLoading: profileLoading } = useProfileData();

  useEffect(() => {
    if (!isAuthReady) return;

    if (!isAuthenticated) {
      router.replace(ROUTES.AUTH.WELCOME);
      return;
    }

    if (onboardingComplete) {
      router.replace(ROUTES.MAIN.DASHBOARD);
      return;
    }

    if (profileLoading) return;

    const segmentList = segments as string[];
    const inOnboarding = segmentList[0] === '(onboarding)';
    const currentStep = segmentList[1] as OnboardingStep | undefined;
    const requiredStep = getRequiredOnboardingStep(profile);
    const requiredRoute = getRequiredOnboardingRoute(profile);

    if (!inOnboarding) {
      router.replace(requiredRoute as typeof ROUTES.ONBOARDING.BASIC_INFO);
      return;
    }

    if (!currentStep || !ONBOARDING_STEP_ORDER.includes(currentStep)) {
      router.replace(requiredRoute as typeof ROUTES.ONBOARDING.BASIC_INFO);
      return;
    }

    // Prevent skipping ahead — e.g. finishing step 3 without saving steps 1–2.
    if (getOnboardingStepIndex(currentStep) > getOnboardingStepIndex(requiredStep)) {
      router.replace(requiredRoute as typeof ROUTES.ONBOARDING.BASIC_INFO);
    }
  }, [
    isAuthenticated,
    isAuthReady,
    onboardingComplete,
    profile,
    profileLoading,
    router,
    segments,
  ]);
}
