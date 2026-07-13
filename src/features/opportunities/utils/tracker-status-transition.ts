import type { TrackerItem } from '@/features/opportunities/utils/filter-tracker';
import type { TrackerStage } from '@/types/domain/tracker';

export type StatusTransition = {
  opportunityId: string;
  stage: TrackerStage;
  previousStage: TrackerStage;
};

/** Returns the transition to apply when a stage is picked in the status sheet, or null if it's a no-op (same stage picked again). */
export function resolveStatusTransition(
  item: Pick<TrackerItem, 'opportunityId' | 'stage'>,
  pickedStage: TrackerStage,
): StatusTransition | null {
  if (pickedStage === item.stage) return null;
  return {
    opportunityId: item.opportunityId,
    stage: pickedStage,
    previousStage: item.stage,
  };
}
