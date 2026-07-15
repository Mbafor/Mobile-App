import type { TrackerItem } from '@/features/opportunities/utils/filter-tracker';
import type { Opportunity } from '@/types/domain/opportunity';
import type { TrackerStage } from '@/types/domain/tracker';

export function makeOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: 'opp-1',
    title: 'Sample Opportunity',
    description: null,
    organization: 'Sample Org',
    imageUrl: null,
    applyUrl: 'https://example.com/apply',
    deadline: null,
    tags: [],
    country: null,
    category: null,
    fundingType: null,
    degreeLevels: [],
    locationType: null,
    status: 'approved',
    isActive: true,
    source: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    postedBy: null,
    ...overrides,
  };
}

export function makeTrackerItem(overrides: {
  opportunityId?: string;
  stage?: TrackerStage;
  notes?: string;
  savedAt?: string;
  updatedAt?: string;
  opportunity?: Partial<Opportunity>;
} = {}): TrackerItem {
  const opportunityId = overrides.opportunityId ?? 'opp-1';
  return {
    opportunityId,
    stage: overrides.stage ?? 'saved',
    notes: overrides.notes ?? '',
    savedAt: overrides.savedAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-01-01T00:00:00.000Z',
    opportunity: makeOpportunity({ id: opportunityId, ...overrides.opportunity }),
  };
}
