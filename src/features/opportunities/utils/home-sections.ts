import type { Opportunity } from '@/types/domain/opportunity';
import { rankOpportunitiesByTagMatch } from '@/features/opportunities/utils/recommendations';

const CLOSING_SOON_DAYS = 14;
const SECTION_LIMIT = 10;

function isActive(opportunity: Opportunity): boolean {
  if (!opportunity.deadline) return true;
  return new Date(opportunity.deadline).getTime() > Date.now();
}

export function filterActive(opportunities: Opportunity[]): Opportunity[] {
  return opportunities.filter(isActive);
}

/** Recommended: match interests + opportunity_types to tags; rank by match count (min 1).
 *  Falls back to most-recent when the user has not configured any interests yet. */
export function buildRecommendedForYou(
  opportunities: Opportunity[],
  interests: string[],
  opportunityTypes: string[],
): Opportunity[] {
  const active = filterActive(opportunities);

  if (interests.length === 0 && opportunityTypes.length === 0) {
    return [...active]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, SECTION_LIMIT);
  }

  return rankOpportunitiesByTagMatch(active, interests, opportunityTypes)
    .map((row) => row.opportunity)
    .slice(0, SECTION_LIMIT);
}

export function buildRecentlyUploaded(opportunities: Opportunity[]): Opportunity[] {
  return [...opportunities]
    .filter(isActive)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, SECTION_LIMIT);
}

export function buildClosingSoon(opportunities: Opportunity[]): Opportunity[] {
  const now = Date.now();
  const horizon = now + CLOSING_SOON_DAYS * 24 * 60 * 60 * 1000;

  return [...opportunities]
    .filter((item) => {
      if (!item.deadline) return false;
      const deadline = new Date(item.deadline).getTime();
      return deadline > now && deadline <= horizon;
    })
    .sort(
      (a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
    )
    .slice(0, SECTION_LIMIT);
}

/** Trending: opportunities ranked by platform-wide save count, in server-ranked order. */
export function buildTrending(
  opportunities: Opportunity[],
  trendingIds: string[],
): Opportunity[] {
  const active = filterActive(opportunities);
  const byId = new Map(active.map((item) => [item.id, item]));
  return trendingIds
    .map((id) => byId.get(id))
    .filter((item): item is Opportunity => Boolean(item))
    .slice(0, SECTION_LIMIT);
}

/** Fallback when no opportunity has been saved yet: alternate closing-soon and recent picks. */
export function buildTrendingFallback(opportunities: Opportunity[]): Opportunity[] {
  const closing = buildClosingSoon(opportunities);
  const recent = buildRecentlyUploaded(opportunities);
  const seen = new Set<string>();
  const merged: Opportunity[] = [];

  for (let i = 0; i < Math.max(closing.length, recent.length); i++) {
    for (const item of [closing[i], recent[i]]) {
      if (item && !seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }
  }

  return merged.slice(0, SECTION_LIMIT);
}

export function buildFullyFunded(opportunities: Opportunity[]): Opportunity[] {
  return [...filterActive(opportunities)]
    .filter((item) => item.fundingType === 'fully_funded')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, SECTION_LIMIT);
}
