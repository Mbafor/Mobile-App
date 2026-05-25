import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { FilterDropdownGroup } from '@/features/opportunities/components/FilterDropdownGroup';
import { FILTER_CATEGORIES, FILTER_DEADLINE_RANGES } from '@/constants/search-filters';
import { spacing } from '@/constants/theme';
import {
  EMPTY_TRACKER_FILTERS,
  TRACKER_STAGE_LABELS,
  TRACKER_STAGE_ORDER,
  type TrackerFilters,
  type TrackerSavedDateRange,
} from '@/types/domain/tracker';

const SAVED_DATE_OPTIONS: { value: TrackerSavedDateRange; label: string }[] = [
  { value: 'any', label: 'Any time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

type TrackerFiltersPanelProps = {
  filters: TrackerFilters;
  onChange: (filters: TrackerFilters) => void;
  onClose?: () => void;
};

export function TrackerFiltersPanel({ filters, onChange, onClose }: TrackerFiltersPanelProps) {
  const patch = (partial: Partial<TrackerFilters>) => onChange({ ...filters, ...partial });

  const stageOptions = TRACKER_STAGE_ORDER.map((s) => ({
    value: s,
    label: TRACKER_STAGE_LABELS[s],
  }));

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text variant="title">Filters</Text>
        <Button variant="ghost" onPress={() => onChange(EMPTY_TRACKER_FILTERS)}>
          Clear all
        </Button>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <FilterDropdownGroup
          label="Stage"
          options={stageOptions}
          selected={filters.stages}
          onChange={(stages) => patch({ stages })}
        />
        <FilterDropdownGroup
          label="Category / tag"
          options={FILTER_CATEGORIES}
          selected={filters.categories}
          onChange={(categories) => patch({ categories })}
        />
        <FilterDropdownGroup
          label="Deadline"
          options={FILTER_DEADLINE_RANGES}
          selected={filters.deadlineRange === 'any' ? [] : [filters.deadlineRange]}
          onChange={(selected) => patch({ deadlineRange: selected[0] ?? 'any' })}
          single
        />
        <FilterDropdownGroup<TrackerSavedDateRange>
          label="Date saved"
          options={SAVED_DATE_OPTIONS}
          selected={filters.savedDateRange === 'any' ? [] : [filters.savedDateRange]}
          onChange={(selected) => patch({ savedDateRange: selected[0] ?? 'any' })}
          single
        />
      </ScrollView>

      {onClose ? (
        <Button onPress={onClose} style={styles.applyBtn}>
          Show results
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { maxHeight: 480 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  applyBtn: { margin: spacing.md, marginTop: spacing.sm },
});
