import { resolveStatusTransition } from '@/features/opportunities/utils/tracker-status-transition';

describe('resolveStatusTransition', () => {
  it('returns a transition when a different stage is picked', () => {
    const result = resolveStatusTransition(
      { opportunityId: 'opp-1', stage: 'saved' },
      'applied',
    );
    expect(result).toEqual({
      opportunityId: 'opp-1',
      stage: 'applied',
      previousStage: 'saved',
    });
  });

  it('returns null when the picked stage matches the current stage (no-op)', () => {
    const result = resolveStatusTransition(
      { opportunityId: 'opp-1', stage: 'interview' },
      'interview',
    );
    expect(result).toBeNull();
  });

  it('supports moving backward as well as forward', () => {
    const result = resolveStatusTransition(
      { opportunityId: 'opp-2', stage: 'offer' },
      'applied',
    );
    expect(result).toEqual({
      opportunityId: 'opp-2',
      stage: 'applied',
      previousStage: 'offer',
    });
  });

  it('preserves the opportunity id through the transition', () => {
    const result = resolveStatusTransition(
      { opportunityId: 'unique-id-123', stage: 'saved' },
      'closed',
    );
    expect(result?.opportunityId).toBe('unique-id-123');
  });
});
