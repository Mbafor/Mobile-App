import { useTranslation } from 'react-i18next';

import { FilterChips } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { TRACKER_STAGE_ORDER, type TrackerStage } from '@/types/domain/tracker';

export type TrackerFilterValue = 'all' | TrackerStage;

type TrackerFilterChipsProps = {
  selected: TrackerFilterValue;
  onSelect: (value: TrackerFilterValue) => void;
  totalCount: number;
  stageCounts: Record<TrackerStage, number>;
};

export function TrackerFilterChips({
  selected,
  onSelect,
  totalCount,
  stageCounts,
}: TrackerFilterChipsProps) {
  const { t } = useTranslation();

  const options = [
    { value: 'all' as const, label: t('opportunities.tracker.filterAll'), count: totalCount },
    ...TRACKER_STAGE_ORDER.map((stage) => ({
      value: stage,
      label: t(`opportunities.tracker.stages.${stage}`),
      count: stageCounts[stage],
    })),
  ];

  return (
    <FilterChips
      options={options}
      selected={selected}
      onSelect={onSelect}
      style={{ paddingHorizontal: spacing.md }}
    />
  );
}
