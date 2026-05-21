import type { Opportunity } from '@/types/domain/opportunity';
import { rankOpportunitiesByTagMatch } from '@/features/opportunities/utils/recommendations';

const CLOSING_SOON_DAYS = 14;
const SECTION_LIMIT = 10;

function isActive(opportunity: Opportunity): boolean {
  return new Date(opportunity.deadline).getTime() > Date.now();
}

export function filterActive(opportunities: Opportunity[]): Opportunity[] {
  return opportunities.filter(isActive);
}

/** Recommended: match interests + opportunity_types to tags; rank by match count (min 1). */
export function buildRecommendedForYou(
  opportunities: Opportunity[],
  interests: string[],
  opportunityTypes: string[],
): Opportunity[] {
  const active = filterActive(opportunities);

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
      const deadline = new Date(item.deadline).getTime();
      return deadline > now && deadline <= horizon;
    })
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    )
    .slice(0, SECTION_LIMIT);
}
