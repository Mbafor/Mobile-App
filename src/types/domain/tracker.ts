export const TRACKER_STAGES = [
  'saved',
  'applied',
  'interview',
  'offer',
  'closed',
] as const;

export type TrackerStage = (typeof TRACKER_STAGES)[number];

export const TRACKER_STAGE_LABELS: Record<TrackerStage, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  closed: 'Closed',
};

export const TRACKER_STAGE_ORDER: TrackerStage[] = [...TRACKER_STAGES];

export function nextTrackerStage(stage: TrackerStage): TrackerStage | null {
  const idx = TRACKER_STAGE_ORDER.indexOf(stage);
  if (idx < 0 || idx >= TRACKER_STAGE_ORDER.length - 1) return null;
  return TRACKER_STAGE_ORDER[idx + 1] ?? null;
}

export function isAppliedOrBeyond(stage: TrackerStage): boolean {
  return stage !== 'saved';
}

export type TrackerSavedDateRange = 'any' | '7d' | '30d' | '90d';

export type TrackerFilters = {
  stages: TrackerStage[];
  categories: string[];
  deadlineRange: 'any' | '7d' | '14d' | '30d' | '90d';
  savedDateRange: TrackerSavedDateRange;
};

export const EMPTY_TRACKER_FILTERS: TrackerFilters = {
  stages: [],
  categories: [],
  deadlineRange: 'any',
  savedDateRange: 'any',
};

export type TrackedOpportunityMeta = {
  opportunityId: string;
  stage: TrackerStage;
  notes: string;
  savedAt: string;
  updatedAt: string;
};
