import type { DeadlineRangeFilter, LocationType } from '@/types/domain/opportunity';

export const FILTER_COUNTRIES = [
  'United Kingdom',
  'United States',
  'Germany',
  'Canada',
  'Global',
] as const;

export const FILTER_CATEGORIES = [
  'Internship',
  'Scholarship',
  'Fellowship',
  'Graduate Programme',
  'Grant & Funding',
  'Bootcamp & Training',
  'Exchange Programme',
  'Job (Full-time)',
  'Research Opportunity',
] as const;

export const FILTER_FUNDING_TYPES = [
  'fully_funded',
  'partially_funded',
  'self_funded',
  'any',
] as const;

export const FILTER_DEGREE_LEVELS = [
  'high_school',
  'bachelors',
  'masters',
  'phd',
  'professional',
] as const;

export const FILTER_LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];

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
