import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { FilterDropdownGroup } from '@/features/opportunities/components/FilterDropdownGroup';
import {
  FILTER_CATEGORIES,
  FILTER_COUNTRIES,
  FILTER_DEADLINE_RANGES,
  FILTER_DEGREE_LEVELS,
  FILTER_FUNDING_TYPES,
  FILTER_LOCATION_TYPES,
  FUNDING_TYPE_LABELS,
} from '@/constants/search-filters';
import { spacing } from '@/constants/theme';
import {
  EMPTY_OPPORTUNITY_FILTERS,
  type DeadlineRangeFilter,
  type OpportunityFilters,
} from '@/types/domain/opportunity';

type OpportunityFiltersPanelProps = {
  filters: OpportunityFilters;
  onChange: (filters: OpportunityFilters) => void;
  onClose?: () => void;
};

export function OpportunityFiltersPanel({
  filters,
  onChange,
  onClose,
}: OpportunityFiltersPanelProps) {
  const { t } = useTranslation();
  const patch = (partial: Partial<OpportunityFilters>) =>
    onChange({ ...filters, ...partial });

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text variant="title">{t('opportunities.filtersPanel.title')}</Text>
        <Button variant="ghost" onPress={() => onChange(EMPTY_OPPORTUNITY_FILTERS)}>
          {t('opportunities.filtersPanel.clearAll')}
        </Button>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <FilterDropdownGroup
          label={t('opportunities.filtersPanel.country')}
          options={FILTER_COUNTRIES}
          selected={filters.countries}
          onChange={(countries) => patch({ countries })}
        />
        <FilterDropdownGroup
          label={t('opportunities.filtersPanel.category')}
          options={FILTER_CATEGORIES}
          selected={filters.categories}
          onChange={(categories) => patch({ categories })}
        />
        <FilterDropdownGroup
          label={t('opportunities.filtersPanel.fundingType')}
          options={FILTER_FUNDING_TYPES}
          selected={filters.fundingTypes}
          onChange={(fundingTypes) => patch({ fundingTypes })}
          formatLabel={(v) => FUNDING_TYPE_LABELS[v] ?? v}
        />
        <FilterDropdownGroup
          label={t('opportunities.filtersPanel.degreeLevel')}
          options={FILTER_DEGREE_LEVELS}
          selected={filters.degreeLevels}
          onChange={(degreeLevels) => patch({ degreeLevels })}
          formatLabel={(v) => v.replace('_', ' ')}
        />
        <FilterDropdownGroup
          label={t('opportunities.filtersPanel.locationType')}
          options={FILTER_LOCATION_TYPES}
          selected={filters.locationTypes}
          onChange={(locationTypes) => patch({ locationTypes })}
        />
        <FilterDropdownGroup<DeadlineRangeFilter>
          label={t('opportunities.filtersPanel.deadline')}
          options={FILTER_DEADLINE_RANGES}
          selected={filters.deadlineRange === 'any' ? [] : [filters.deadlineRange]}
          onChange={(selected) => patch({ deadlineRange: selected[0] ?? 'any' })}
          single
        />
      </ScrollView>

      {onClose ? (
        <Button onPress={onClose} style={styles.applyBtn}>
          {t('opportunities.filtersPanel.showResults')}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { maxHeight: 420 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  applyBtn: { margin: spacing.md, marginTop: spacing.sm },
});
