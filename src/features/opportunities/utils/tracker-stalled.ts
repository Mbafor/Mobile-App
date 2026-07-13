import type { TrackerItem } from '@/features/opportunities/utils/filter-tracker';
import type { TrackerStage } from '@/types/domain/tracker';

export const STALLED_STAGES: readonly TrackerStage[] = ['applied', 'interview'];
export const STALLED_THRESHOLD_DAYS = 14;

export type StalledEntry = {
  item: TrackerItem;
  daysSinceUpdate: number;
};

export function daysSince(iso: string, now: number = Date.now()): number {
  const ms = now - new Date(iso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/** Applied/Interview cards with no status change in STALLED_THRESHOLD_DAYS+, oldest first. */
export function findStalledItems(items: TrackerItem[], now: number = Date.now()): StalledEntry[] {
  return items
    .filter((item) => STALLED_STAGES.includes(item.stage))
    .map((item) => ({ item, daysSinceUpdate: daysSince(item.updatedAt, now) }))
    .filter((entry) => entry.daysSinceUpdate >= STALLED_THRESHOLD_DAYS)
    .sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);
}
