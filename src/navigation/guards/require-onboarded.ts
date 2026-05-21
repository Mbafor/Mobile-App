import { ROUTES } from '@/constants/routes';

import type { GuardResult } from '@/navigation/guards/require-auth';

export function requireOnboarded(onboardingComplete: boolean): GuardResult {
  if (onboardingComplete) return { allowed: true };
  return { allowed: false, redirect: ROUTES.ONBOARDING.BASIC_INFO };
}
