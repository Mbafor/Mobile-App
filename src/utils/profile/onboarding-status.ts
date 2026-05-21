import type { Profile } from '@/types/domain/profile';

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
