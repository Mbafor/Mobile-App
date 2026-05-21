import type { Opportunity } from '@/types/domain/opportunity';

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/** True when a profile interest or opportunity type aligns with an opportunity tag. */
export function tagMatchesKeyword(tag: string, keyword: string): boolean {
  const t = normalize(tag);
  const k = normalize(keyword);
  if (!t || !k) return false;
  if (t === k) return true;
  if (t.includes(k) || k.includes(t)) return true;

  const tTokens = t.split(/[\s,&/]+/).filter(Boolean);
  const kTokens = k.split(/[\s,&/]+/).filter(Boolean);
  return tTokens.some((tt) =>
    kTokens.some((kt) => tt === kt || tt.includes(kt) || kt.includes(tt)),
  );
}

/** Number of opportunity tags that match at least one interest or opportunity type. */
export function countMatchingTags(opportunity: Opportunity, keywords: string[]): number {
  const uniqueKeywords = [...new Set(keywords.map(normalize).filter(Boolean))];
  if (uniqueKeywords.length === 0) return 0;

  return opportunity.tags.filter((tag) =>
    uniqueKeywords.some((keyword) => tagMatchesKeyword(tag, keyword)),
  ).length;
}

export type RankedOpportunity = {
  opportunity: Opportunity;
  matchCount: number;
  matchedTags: string[];
};

export function rankOpportunitiesByTagMatch(
  opportunities: Opportunity[],
  interests: string[],
  opportunityTypes: string[],
): RankedOpportunity[] {
  const keywords = [...interests, ...opportunityTypes];

  return opportunities
    .map((opportunity) => {
      const matchedTags = opportunity.tags.filter((tag) =>
        keywords.some((keyword) => tagMatchesKeyword(tag, keyword)),
      );
      return {
        opportunity,
        matchCount: matchedTags.length,
        matchedTags,
      };
    })
    .filter((row) => row.matchCount >= 1)
    .sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return (
        new Date(b.opportunity.createdAt).getTime() -
        new Date(a.opportunity.createdAt).getTime()
      );
    });
}
