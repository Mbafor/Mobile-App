import type {
  DeadlineRangeFilter,
  Opportunity,
  OpportunityFilters,
} from '@/types/domain/opportunity';

const DEADLINE_MS: Record<Exclude<DeadlineRangeFilter, 'any'>, number> = {
  '7d': 7 * 24 * 60 * 60 * 1000,
  '14d': 14 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/** Loose containment that also bridges plural/singular mismatches (e.g. "fellowships" ↔ "fellowship"). */
function looseIncludes(haystack: string, word: string): boolean {
  return haystack.includes(word) || word.includes(haystack);
}

function matchesQuery(opportunity: Opportunity, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;

  const haystacks = [
    normalize(opportunity.title),
    normalize(opportunity.organization),
    opportunity.category ? normalize(opportunity.category) : null,
    opportunity.fundingType ? normalize(opportunity.fundingType) : null,
    opportunity.locationType ? normalize(opportunity.locationType) : null,
    opportunity.country ? normalize(opportunity.country) : null,
    ...opportunity.tags.map(normalize),
  ].filter((h): h is string => Boolean(h));

  // Match if any query word matches any field — favors recall so a phrase like
  // "PhD fellowships" or "Remote internships" doesn't come back empty.
  return words.some((word) => haystacks.some((haystack) => looseIncludes(haystack, word)));
}

function matchesDeadlineRange(
  opportunity: Opportunity,
  range: DeadlineRangeFilter,
): boolean {
  if (range === 'any') return true;
  if (!opportunity.deadline) return false;

  const now = Date.now();
  const deadline = new Date(opportunity.deadline).getTime();
  if (deadline <= now) return false;

  const maxMs = DEADLINE_MS[range];
  return deadline - now <= maxMs;
}

function matchesArrayFilter<T extends string>(
  selected: T[],
  value: T | null | undefined,
): boolean {
  if (selected.length === 0) return true;
  if (!value) return false;
  return selected.includes(value);
}

function matchesDegreeLevels(
  selected: string[],
  levels: string[],
): boolean {
  if (selected.length === 0) return true;
  if (levels.length === 0) return false;
  return levels.some((level) => selected.includes(level));
}

export function filterOpportunities(
  opportunities: Opportunity[],
  query: string,
  filters: OpportunityFilters,
): Opportunity[] {
  return opportunities.filter((item) => {
    if (!matchesQuery(item, query)) return false;
    if (!matchesArrayFilter(filters.countries, item.country ?? undefined)) return false;
    if (!matchesArrayFilter(filters.categories, item.category ?? undefined)) return false;
    if (!matchesArrayFilter(filters.fundingTypes, item.fundingType ?? undefined)) return false;
    if (!matchesDegreeLevels(filters.degreeLevels, item.degreeLevels)) return false;
    if (
      filters.locationTypes.length > 0 &&
      (!item.locationType || !filters.locationTypes.includes(item.locationType))
    ) {
      return false;
    }
    if (!matchesDeadlineRange(item, filters.deadlineRange)) return false;
    return true;
  });
}

export function countActiveFilters(filters: OpportunityFilters): number {
  let count = 0;
  if (filters.countries.length) count += 1;
  if (filters.categories.length) count += 1;
  if (filters.fundingTypes.length) count += 1;
  if (filters.degreeLevels.length) count += 1;
  if (filters.locationTypes.length) count += 1;
  if (filters.deadlineRange !== 'any') count += 1;
  return count;
}
