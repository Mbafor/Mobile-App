import { ROUTES } from '@/constants/routes';
import type { Profile } from '@/types/domain/profile';

export const ONBOARDING_STEP_ORDER = [
  'basic-information',
  'academic-information',
  'opportunity-preferences',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEP_ORDER)[number];

const STEP_ROUTES: Record<OnboardingStep, string> = {
  'basic-information': ROUTES.ONBOARDING.BASIC_INFO,
  'academic-information': ROUTES.ONBOARDING.ACADEMIC,
  'opportunity-preferences': ROUTES.ONBOARDING.PREFERENCES,
};

/** True when the user still needs the onboarding flow (steps 1–3). */
export function profileNeedsOnboarding(profile: Profile | null | undefined): boolean {
  if (!profile) return true;
  if (!profile.onboardingComplete) return true;
  return !hasCompletedOnboardingFields(profile);
}

export function hasCompletedOnboardingFields(profile: Profile): boolean {
  return Boolean(
    profile.fullName?.trim() &&
      profile.country?.trim() &&
      profile.university?.trim() &&
      profile.courseMajor?.trim() &&
      profile.interests.length > 0,
  );
}

export function hasCompletedBasicInfo(profile: Profile | null | undefined): boolean {
  return Boolean(profile?.fullName?.trim() && profile?.country?.trim());
}

export function hasCompletedAcademicInfo(profile: Profile | null | undefined): boolean {
  return Boolean(
    profile?.university?.trim() &&
      profile?.courseMajor?.trim() &&
      (profile?.interests?.length ?? 0) > 0,
  );
}

/** Earliest onboarding step the user must complete based on saved profile data. */
export function getRequiredOnboardingStep(profile: Profile | null | undefined): OnboardingStep {
  if (!hasCompletedBasicInfo(profile)) return 'basic-information';
  if (!hasCompletedAcademicInfo(profile)) return 'academic-information';
  return 'opportunity-preferences';
}

export function getRequiredOnboardingRoute(profile: Profile | null | undefined): string {
  return STEP_ROUTES[getRequiredOnboardingStep(profile)];
}

export function getOnboardingStepIndex(step: OnboardingStep): number {
  return ONBOARDING_STEP_ORDER.indexOf(step);
}
