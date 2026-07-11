/**
 * Single source of truth for opportunity field options — shared by admin forms,
 * dashboard filters, and browse-by-category (aligned with user onboarding prefs).
 */
import type { SelectOption } from '@/constants/onboarding-options';
import {
  getInterestOptions,
  getOpportunityTypeOptions,
  PREDEFINED_INTERESTS,
  PREDEFINED_OPPORTUNITY_TYPES,
} from '@/constants/onboarding-options';
import {
  DEGREE_LEVEL_VALUES,
  getDegreeLevels,
  getFundingOptions,
  type DegreeLevelValue,
} from '@/constants/onboarding';
import { getCountryOptions, PREDEFINED_COUNTRIES } from '@/constants/countries';
import i18n from '@/i18n';
import type { FundingPreference } from '@/types/domain/user-preferences';
import type { LocationType } from '@/types/domain/opportunity';

/** Same labels as user "opportunity types" preference & browse categories. Call at render time. */
export function getOpportunityCategoryOptions(): SelectOption[] {
  return getOpportunityTypeOptions();
}
export const PREDEFINED_OPPORTUNITY_CATEGORIES = PREDEFINED_OPPORTUNITY_TYPES;

/** Same labels as user profile "interests" — stored in opportunity `tags`. Call at render time. */
export function getOpportunityTagOptions(): SelectOption[] {
  return getInterestOptions();
}
export const PREDEFINED_OPPORTUNITY_TAGS = PREDEFINED_INTERESTS;

/** Profile countries + Global for remote/worldwide listings. Call at render time. */
export function getOpportunityCountryOptions(): SelectOption[] {
  return [...getCountryOptions(), { label: i18n.t('shared.options.global'), value: 'Global' }];
}

export const PREDEFINED_OPPORTUNITY_COUNTRIES = [
  ...PREDEFINED_COUNTRIES,
  'Global',
] as const;

/** Same values as profile degree level & search filters. Call at render time. */
export function getOpportunityDegreeOptions(): { value: DegreeLevelValue; label: string }[] {
  return getDegreeLevels();
}

export const OPPORTUNITY_DEGREE_VALUES = DEGREE_LEVEL_VALUES;

/** Funding on listings (excludes user pref "any"). Call at render time. */
export function getOpportunityFundingOptions(): { value: FundingPreference; label: string }[] {
  return getFundingOptions().filter((o) => o.value !== 'any');
}

export const OPPORTUNITY_LOCATION_OPTIONS: { value: LocationType; label: string }[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];

export const OPPORTUNITY_LOCATION_SELECT_OPTIONS: SelectOption[] =
  OPPORTUNITY_LOCATION_OPTIONS.map((o) => ({
    label: o.label,
    value: o.value,
  }));

export const PREDEFINED_OPPORTUNITY_LOCATIONS = OPPORTUNITY_LOCATION_OPTIONS.map((o) => o.value);

/** Browse drawer & filter chips use the same category list. */
export const BROWSE_CATEGORY_LIST = [...PREDEFINED_OPPORTUNITY_CATEGORIES] as const;

export type BrowseCategory = (typeof BROWSE_CATEGORY_LIST)[number];

export function categoryToSlug(category: string): string {
  return encodeURIComponent(category);
}

export function slugToCategory(slug: string): string {
  return decodeURIComponent(slug);
}
