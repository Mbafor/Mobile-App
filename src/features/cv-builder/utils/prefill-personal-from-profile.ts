import type { CVPersonalInfo } from '@/types/domain/cv';

export type ProfilePrefillSource = {
  fullName?: string | null;
  email?: string | null;
  location?: string | null;
};

function isEmpty(value: string | undefined | null): boolean {
  return !value?.trim();
}

/** Fills empty personal fields from the user's account profile (never overwrites existing CV data). */
export function mergeProfileIntoPersonalInfo(
  personal: CVPersonalInfo,
  source: ProfilePrefillSource,
): CVPersonalInfo {
  return {
    ...personal,
    fullName: isEmpty(personal.fullName)
      ? (source.fullName?.trim() ?? '')
      : personal.fullName,
    email: isEmpty(personal.email) ? (source.email?.trim() ?? '') : personal.email,
    location: isEmpty(personal.location)
      ? (source.location?.trim() ?? '')
      : personal.location,
  };
}

export function buildProfilePrefillSource(
  dbProfile: {
    fullName?: string | null;
    email?: string | null;
    country?: string | null;
  } | null | undefined,
  auth: { displayName?: string | null; userEmail?: string },
): ProfilePrefillSource {
  return {
    fullName: dbProfile?.fullName?.trim() || auth.displayName?.trim() || null,
    email: dbProfile?.email?.trim() || auth.userEmail?.trim() || null,
    location: dbProfile?.country?.trim() || null,
  };
}
