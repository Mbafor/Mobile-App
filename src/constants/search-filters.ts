import type { DeadlineRangeFilter, LocationType } from '@/types/domain/opportunity';
import { FUNDING_VALUES } from '@/constants/onboarding';
import {
  BROWSE_CATEGORY_LIST,
  OPPORTUNITY_DEGREE_VALUES,
  OPPORTUNITY_LOCATION_OPTIONS,
  PREDEFINED_OPPORTUNITY_COUNTRIES,
} from '@/constants/opportunity-fields';

export const FILTER_COUNTRIES = PREDEFINED_OPPORTUNITY_COUNTRIES;

export const FILTER_CATEGORIES = BROWSE_CATEGORY_LIST;

export const FILTER_FUNDING_TYPES = [
  ...FUNDING_VALUES.filter((v) => v !== 'any'),
  'any',
] as const;

export const FILTER_DEGREE_LEVELS = OPPORTUNITY_DEGREE_VALUES;

export const FILTER_LOCATION_TYPES: { value: LocationType; label: string }[] =
  OPPORTUNITY_LOCATION_OPTIONS;

export const FILTER_DEADLINE_RANGES: { value: DeadlineRangeFilter; label: string }[] = [
  { value: 'any', label: 'Any deadline' },
  { value: '7d', label: 'Next 7 days' },
  { value: '14d', label: 'Next 14 days' },
  { value: '30d', label: 'Next 30 days' },
  { value: '90d', label: 'Next 90 days' },
];

export const FUNDING_TYPE_LABELS: Record<string, string> = {
  fully_funded: 'Fully funded',
  partially_funded: 'Partially funded',
  self_funded: 'Self-funded',
  any: 'Any funding',
};
