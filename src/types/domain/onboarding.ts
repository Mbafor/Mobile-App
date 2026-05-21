import type { FundingPreference } from '@/types/domain/user-preferences';

export type OnboardingBasicInfo = {
  fullName: string;
  country: string;
};

export type OnboardingAcademicInfo = {
  university: string;
  degreeLevel: string;
  courseMajor: string;
  interests: string[];
  careerInterests: string[];
};

export type OnboardingOpportunityPrefs = {
  opportunityTypes: string[];
  preferredCountries: string[];
  fundingPreference: FundingPreference;
};

export type OnboardingData = OnboardingBasicInfo &
  OnboardingAcademicInfo &
  OnboardingOpportunityPrefs;
