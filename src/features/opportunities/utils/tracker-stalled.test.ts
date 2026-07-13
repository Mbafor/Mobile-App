import { findStalledItems, daysSince } from '@/features/opportunities/utils/tracker-stalled';
import { makeTrackerItem } from '@/features/opportunities/utils/__fixtures__/tracker-fixtures';

const NOW = new Date('2026-06-15T00:00:00.000Z').getTime();

function daysAgoIso(days: number): string {
  return new Date(NOW - days * 24 * 60 * 60 * 1000).toISOString();
}

describe('daysSince', () => {
  it('computes whole days elapsed since a timestamp', () => {
    expect(daysSince(daysAgoIso(5), NOW)).toBe(5);
    expect(daysSince(daysAgoIso(0), NOW)).toBe(0);
  });
});

describe('findStalledItems', () => {
  it('flags Applied cards stuck for 14+ days', () => {
    const item = makeTrackerItem({ opportunityId: 'a', stage: 'applied', updatedAt: daysAgoIso(18) });
    const result = findStalledItems([item], NOW);
    expect(result).toHaveLength(1);
    expect(result[0].item.opportunityId).toBe('a');
    expect(result[0].daysSinceUpdate).toBe(18);
  });

  it('flags Interview cards stuck for 14+ days', () => {
    const item = makeTrackerItem({ opportunityId: 'b', stage: 'interview', updatedAt: daysAgoIso(20) });
    const result = findStalledItems([item], NOW);
    expect(result).toHaveLength(1);
  });

  it('does not flag cards updated fewer than 14 days ago', () => {
    const item = makeTrackerItem({ opportunityId: 'c', stage: 'applied', updatedAt: daysAgoIso(13) });
    expect(findStalledItems([item], NOW)).toHaveLength(0);
  });

  it('includes the boundary at exactly 14 days', () => {
    const item = makeTrackerItem({ opportunityId: 'd', stage: 'applied', updatedAt: daysAgoIso(14) });
    expect(findStalledItems([item], NOW)).toHaveLength(1);
  });

  it('never flags Saved, Offer, or Closed regardless of age', () => {
    const items = [
      makeTrackerItem({ opportunityId: 'saved', stage: 'saved', updatedAt: daysAgoIso(100) }),
      makeTrackerItem({ opportunityId: 'offer', stage: 'offer', updatedAt: daysAgoIso(100) }),
      makeTrackerItem({ opportunityId: 'closed', stage: 'closed', updatedAt: daysAgoIso(100) }),
    ];
    expect(findStalledItems(items, NOW)).toHaveLength(0);
  });

  it('sorts the most-stalled item first', () => {
    const items = [
      makeTrackerItem({ opportunityId: 'newer', stage: 'applied', updatedAt: daysAgoIso(15) }),
      makeTrackerItem({ opportunityId: 'oldest', stage: 'interview', updatedAt: daysAgoIso(40) }),
      makeTrackerItem({ opportunityId: 'middle', stage: 'applied', updatedAt: daysAgoIso(20) }),
    ];
    const result = findStalledItems(items, NOW);
    expect(result.map((r) => r.item.opportunityId)).toEqual(['oldest', 'middle', 'newer']);
  });
});
