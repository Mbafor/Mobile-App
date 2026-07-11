import { useTranslation } from 'react-i18next';
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

type TrackerFiltersPanelProps = {
  filters: TrackerFilters;
  onChange: (filters: TrackerFilters) => void;
  onClose?: () => void;
};

export function TrackerFiltersPanel({ filters, onChange, onClose }: TrackerFiltersPanelProps) {
  const { t } = useTranslation();
  const patch = (partial: Partial<TrackerFilters>) => onChange({ ...filters, ...partial });

  const stageOptions = TRACKER_STAGE_ORDER.map((s) => ({
    value: s,
    label: TRACKER_STAGE_LABELS[s],
  }));

  const savedDateOptions: { value: TrackerSavedDateRange; label: string }[] = [
    { value: 'any', label: t('opportunities.tracker.filters.dates.any') },
    { value: '7d', label: t('opportunities.tracker.filters.dates.d7') },
    { value: '30d', label: t('opportunities.tracker.filters.dates.d30') },
    { value: '90d', label: t('opportunities.tracker.filters.dates.d90') },
  ];

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text variant="title">{t('opportunities.tracker.filters.title')}</Text>
        <Button variant="ghost" onPress={() => onChange(EMPTY_TRACKER_FILTERS)}>
          {t('opportunities.tracker.filters.clearAll')}
        </Button>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <FilterDropdownGroup
          label={t('opportunities.tracker.filters.stage')}
          options={stageOptions}
          selected={filters.stages}
          onChange={(stages) => patch({ stages })}
        />
        <FilterDropdownGroup
          label={t('opportunities.tracker.filters.categoryTag')}
          options={FILTER_CATEGORIES}
          selected={filters.categories}
          onChange={(categories) => patch({ categories })}
        />
        <FilterDropdownGroup
          label={t('opportunities.tracker.filters.deadline')}
          options={FILTER_DEADLINE_RANGES}
          selected={filters.deadlineRange === 'any' ? [] : [filters.deadlineRange]}
          onChange={(selected) => patch({ deadlineRange: selected[0] ?? 'any' })}
          single
        />
        <FilterDropdownGroup<TrackerSavedDateRange>
          label={t('opportunities.tracker.filters.dateSaved')}
          options={savedDateOptions}
          selected={filters.savedDateRange === 'any' ? [] : [filters.savedDateRange]}
          onChange={(selected) => patch({ savedDateRange: selected[0] ?? 'any' })}
          single
        />
      </ScrollView>

      {onClose ? (
        <Button onPress={onClose} style={styles.applyBtn}>
          {t('opportunities.tracker.filters.showResults')}
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
