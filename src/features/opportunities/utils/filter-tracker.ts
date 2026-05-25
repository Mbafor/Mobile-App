import type { Opportunity, DeadlineRangeFilter } from '@/types/domain/opportunity';
import type {
  TrackerFilters,
  TrackerSavedDateRange,
  TrackerStage,
  TrackedOpportunityMeta,
} from '@/types/domain/tracker';

export type TrackerItem = TrackedOpportunityMeta & { opportunity: Opportunity };

const SAVED_MS: Record<Exclude<TrackerSavedDateRange, 'any'>, number> = {
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
};

const DEADLINE_MS: Record<Exclude<DeadlineRangeFilter, 'any'>, number> = {
  '7d': 7 * 24 * 60 * 60 * 1000,
  '14d': 14 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matchesQuery(item: TrackerItem, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  if (normalize(item.opportunity.title).includes(q)) return true;
  if (normalize(item.opportunity.organization).includes(q)) return true;
  return false;
}

function matchesDeadlineRange(opportunity: Opportunity, range: DeadlineRangeFilter): boolean {
  if (range === 'any') return true;
  const now = Date.now();
  const deadline = new Date(opportunity.deadline).getTime();
  if (deadline <= now) return false;
  return deadline - now <= DEADLINE_MS[range];
}

function matchesSavedDateRange(savedAt: string, range: TrackerSavedDateRange): boolean {
  if (range === 'any') return true;
  const savedMs = new Date(savedAt).getTime();
  const cutoff = Date.now() - SAVED_MS[range];
  return savedMs >= cutoff;
}

function matchesCategory(opportunity: Opportunity, categories: string[]): boolean {
  if (categories.length === 0) return true;
  const tagSet = new Set(opportunity.tags.map((t) => normalize(t)));
  const category = opportunity.category ? normalize(opportunity.category) : null;
  return categories.some((c) => {
    const n = normalize(c);
    return tagSet.has(n) || category === n;
  });
}

export function filterTrackerItems(
  items: TrackerItem[],
  query: string,
  filters: TrackerFilters,
): TrackerItem[] {
  return items.filter((item) => {
    if (!matchesQuery(item, query)) return false;
    if (filters.stages.length > 0 && !filters.stages.includes(item.stage)) return false;
    if (!matchesCategory(item.opportunity, filters.categories)) return false;
    if (!matchesDeadlineRange(item.opportunity, filters.deadlineRange)) return false;
    if (!matchesSavedDateRange(item.savedAt, filters.savedDateRange)) return false;
    return true;
  });
}

export function countActiveTrackerFilters(filters: TrackerFilters): number {
  let count = 0;
  if (filters.stages.length > 0) count += 1;
  if (filters.categories.length > 0) count += 1;
  if (filters.deadlineRange !== 'any') count += 1;
  if (filters.savedDateRange !== 'any') count += 1;
  return count;
}

export function groupByStage(
  items: TrackerItem[],
): Record<TrackerStage, TrackerItem[]> {
  const groups: Record<TrackerStage, TrackerItem[]> = {
    saved: [],
    applied: [],
    interview: [],
    offer: [],
    closed: [],
  };
  for (const item of items) {
    groups[item.stage].push(item);
  }
  return groups;
}
