export type LocationType = 'remote' | 'onsite' | 'hybrid';

export type Opportunity = {
  id: string;
  title: string;
  description: string | null;
  organization: string;
  imageUrl: string | null;
  applyUrl: string | null;
  deadline: string | null;
  tags: string[];
  country: string | null;
  category: string | null;
  fundingType: string | null;
  degreeLevels: string[];
  locationType: LocationType | null;
  status: string;
  isActive: boolean;
  source: string | null;
  createdAt: string;
  updatedAt: string;
  postedBy: { name: string; kind: 'partner' | 'admin' | 'superadmin' } | null;
};

export type DeadlineRangeFilter = 'any' | '7d' | '14d' | '30d' | '90d';

export type OpportunityFilters = {
  countries: string[];
  categories: string[];
  fundingTypes: string[];
  degreeLevels: string[];
  locationTypes: LocationType[];
  deadlineRange: DeadlineRangeFilter;
};

export const EMPTY_OPPORTUNITY_FILTERS: OpportunityFilters = {
  countries: [],
  categories: [],
  fundingTypes: [],
  degreeLevels: [],
  locationTypes: [],
  deadlineRange: 'any',
};
