import i18n from '@/i18n';
import type { FundingPreference } from '@/types/domain/user-preferences';

export const DEGREE_LEVEL_VALUES = [
  'high_school',
  'bachelors',
  'masters',
  'phd',
  'professional',
] as const;

export type DegreeLevelValue = (typeof DEGREE_LEVEL_VALUES)[number];

/** Translated display options — call at render time, not at module scope. */
export function getDegreeLevels(): { value: DegreeLevelValue; label: string }[] {
  return DEGREE_LEVEL_VALUES.map((value) => ({
    value,
    label: i18n.t(`shared.options.degreeLevels.${value}`),
  }));
}

export const FUNDING_VALUES: FundingPreference[] = [
  'any',
  'fully_funded',
  'partially_funded',
  'self_funded',
];

/** Translated display options — call at render time, not at module scope. */
export function getFundingOptions(): { value: FundingPreference; label: string }[] {
  return FUNDING_VALUES.map((value) => ({
    value,
    label: i18n.t(`shared.options.funding.${value}`),
  }));
}

export const ONBOARDING_STEPS = {
  BASIC: 1,
  ACADEMIC: 2,
  PREFERENCES: 3,
  TOTAL: 3,
} as const;
