/**
 * Single source of truth for opportunity field options — shared by admin forms,
 * dashboard filters, and browse-by-category (aligned with user onboarding prefs).
 */
import type { SelectOption } from '@/constants/onboarding-options';
import {
  INTEREST_OPTIONS,
  OPPORTUNITY_TYPE_OPTIONS,
  PREDEFINED_INTERESTS,
  PREDEFINED_OPPORTUNITY_TYPES,
} from '@/constants/onboarding-options';
import { DEGREE_LEVELS, FUNDING_OPTIONS } from '@/constants/onboarding';
import { COUNTRY_OPTIONS, PREDEFINED_COUNTRIES } from '@/constants/countries';
import type { LocationType } from '@/types/domain/opportunity';

/** Same labels as user "opportunity types" preference & browse categories. */
export const OPPORTUNITY_CATEGORY_OPTIONS = OPPORTUNITY_TYPE_OPTIONS;
export const PREDEFINED_OPPORTUNITY_CATEGORIES = PREDEFINED_OPPORTUNITY_TYPES;

/** Same labels as user profile "interests" — stored in opportunity `tags`. */
export const OPPORTUNITY_TAG_OPTIONS = INTEREST_OPTIONS;
export const PREDEFINED_OPPORTUNITY_TAGS = PREDEFINED_INTERESTS;

/** Profile countries + Global for remote/worldwide listings. */
export const OPPORTUNITY_COUNTRY_OPTIONS: SelectOption[] = [
  ...COUNTRY_OPTIONS,
  { label: 'Global', value: 'Global' },
];

export const PREDEFINED_OPPORTUNITY_COUNTRIES = [
  ...PREDEFINED_COUNTRIES,
  'Global',
] as const;

/** Same values as profile degree level & search filters. */
export const OPPORTUNITY_DEGREE_OPTIONS = DEGREE_LEVELS;

export const OPPORTUNITY_DEGREE_VALUES = DEGREE_LEVELS.map((d) => d.value);

/** Funding on listings (excludes user pref "any"). */
export const OPPORTUNITY_FUNDING_OPTIONS = FUNDING_OPTIONS.filter((o) => o.value !== 'any');

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
