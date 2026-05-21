import type { FundingPreference } from '@/types/domain/user-preferences';

export const DEGREE_LEVELS = [
  { value: 'high_school', label: 'High school' },
  { value: 'bachelors', label: "Bachelor's" },
  { value: 'masters', label: "Master's" },
  { value: 'phd', label: 'PhD / Doctorate' },
  { value: 'professional', label: 'Professional / Other' },
] as const;

export const FUNDING_OPTIONS: { value: FundingPreference; label: string }[] = [
  { value: 'any', label: 'Any funding' },
  { value: 'fully_funded', label: 'Fully funded only' },
  { value: 'partially_funded', label: 'Partially funded' },
  { value: 'self_funded', label: 'Self-funded' },
];

export const ONBOARDING_STEPS = {
  BASIC: 1,
  ACADEMIC: 2,
  PREFERENCES: 3,
  TOTAL: 3,
} as const;
