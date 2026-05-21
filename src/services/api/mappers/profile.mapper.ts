import type { ProfileRow, UserPreferencesRow } from '@/services/supabase/types';
import type { Profile } from '@/types/domain/profile';
import type { UserPreferences, FundingPreference } from '@/types/domain/user-preferences';
import type { UserProfile } from '@/types/domain/user';

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    country: row.country,
    university: row.university,
    degreeLevel: row.degree_level,
    courseMajor: row.course_major,
    interests: row.interests ?? [],
    careerInterests: row.career_interests ?? [],
    onboardingComplete: row.onboarding_complete,
    isAdmin: row.is_admin ?? false,
  };
}

export function mapPreferencesRow(row: UserPreferencesRow): UserPreferences {
  return {
    id: row.id,
    userId: row.user_id,
    opportunityTypes: row.opportunity_types ?? [],
    preferredCountries: row.preferred_countries ?? [],
    fundingPreference: (row.funding_preference as FundingPreference | null) ?? null,
  };
}

export function mapToUserProfile(profile: Profile, email: string): UserProfile {
  const isAdmin = profile.isAdmin;
  return {
    id: profile.id,
    email: profile.email ?? email,
    displayName: profile.fullName,
    avatarUrl: null,
    role: isAdmin ? 'admin' : 'member',
    isAdmin,
    onboardingComplete: profile.onboardingComplete,
  };
}
