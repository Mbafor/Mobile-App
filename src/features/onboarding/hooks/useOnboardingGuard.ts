import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

const STEP_ORDER = [
  'basic-information',
  'academic-information',
  'opportunity-preferences',
] as const;

export function useOnboardingGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isAuthReady, onboardingComplete } = useAuth();

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

    const inOnboarding = segments[0] === '(onboarding)';
    const currentStep = segments[1] as (typeof STEP_ORDER)[number] | undefined;

    if (!inOnboarding) {
      router.replace(ROUTES.ONBOARDING.BASIC_INFO);
      return;
    }

    if (!currentStep || !STEP_ORDER.includes(currentStep)) {
      router.replace(ROUTES.ONBOARDING.BASIC_INFO);
    }
  }, [isAuthenticated, isAuthReady, onboardingComplete, router, segments]);
}
