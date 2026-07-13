import { filterTrackerItems, groupByStage } from '@/features/opportunities/utils/filter-tracker';
import { makeTrackerItem } from '@/features/opportunities/utils/__fixtures__/tracker-fixtures';
import { EMPTY_TRACKER_FILTERS, TRACKER_STAGE_ORDER } from '@/types/domain/tracker';

describe('groupByStage (filter chip counts)', () => {
  it('counts items into their current stage bucket', () => {
    const items = [
      makeTrackerItem({ opportunityId: '1', stage: 'saved' }),
      makeTrackerItem({ opportunityId: '2', stage: 'saved' }),
      makeTrackerItem({ opportunityId: '3', stage: 'applied' }),
      makeTrackerItem({ opportunityId: '4', stage: 'interview' }),
      makeTrackerItem({ opportunityId: '5', stage: 'offer' }),
    ];
    const grouped = groupByStage(items);
    expect(grouped.saved).toHaveLength(2);
    expect(grouped.applied).toHaveLength(1);
    expect(grouped.interview).toHaveLength(1);
    expect(grouped.offer).toHaveLength(1);
    expect(grouped.closed).toHaveLength(0);
  });

  it('always returns every stage key, even with zero items', () => {
    const grouped = groupByStage([]);
    for (const stage of TRACKER_STAGE_ORDER) {
      expect(grouped[stage]).toEqual([]);
    }
  });

  it('total across stage buckets matches the input length (counts stay in sync)', () => {
    const items = [
      makeTrackerItem({ opportunityId: '1', stage: 'saved' }),
      makeTrackerItem({ opportunityId: '2', stage: 'applied' }),
      makeTrackerItem({ opportunityId: '3', stage: 'closed' }),
    ];
    const grouped = groupByStage(items);
    const total = TRACKER_STAGE_ORDER.reduce((sum, stage) => sum + grouped[stage].length, 0);
    expect(total).toBe(items.length);
  });
});

describe('filterTrackerItems', () => {
  const items = [
    makeTrackerItem({
      opportunityId: '1',
      stage: 'saved',
      opportunity: { title: 'DAAD Scholarship', organization: 'DAAD' },
    }),
    makeTrackerItem({
      opportunityId: '2',
      stage: 'applied',
      opportunity: { title: 'Fulbright Fellowship', organization: 'Fulbright' },
    }),
    makeTrackerItem({
      opportunityId: '3',
      stage: 'interview',
      opportunity: { title: 'Chevening Scholarship', organization: 'UK Government' },
    }),
  ];

  it('returns everything when no stage filter is applied', () => {
    const result = filterTrackerItems(items, '', EMPTY_TRACKER_FILTERS);
    expect(result).toHaveLength(3);
  });

  it('filters down to a single selected stage', () => {
    const result = filterTrackerItems(items, '', { ...EMPTY_TRACKER_FILTERS, stages: ['applied'] });
    expect(result.map((i) => i.opportunityId)).toEqual(['2']);
  });

  it('combines a text query with a stage filter', () => {
    const result = filterTrackerItems(items, 'Scholarship', {
      ...EMPTY_TRACKER_FILTERS,
      stages: ['saved'],
    });
    expect(result.map((i) => i.opportunityId)).toEqual(['1']);
  });

  it('matches by organization name too', () => {
    const result = filterTrackerItems(items, 'fulbright', EMPTY_TRACKER_FILTERS);
    expect(result.map((i) => i.opportunityId)).toEqual(['2']);
  });

  it('returns nothing for a stage with no matching items', () => {
    const result = filterTrackerItems(items, '', { ...EMPTY_TRACKER_FILTERS, stages: ['closed'] });
    expect(result).toHaveLength(0);
  });
});
