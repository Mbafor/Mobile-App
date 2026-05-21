import { StyleSheet, View } from 'react-native';

import { FilterChipButton, SearchField } from '@/components/ui';
import { spacing } from '@/constants/theme';

type OpportunitySearchBarProps = {
  query: string;
  onChangeQuery: (value: string) => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
};

export function OpportunitySearchBar({
  query,
  onChangeQuery,
  activeFilterCount,
  onOpenFilters,
}: OpportunitySearchBarProps) {
  return (
    <View style={styles.wrap}>
      <SearchField
        value={query}
        onChangeText={onChangeQuery}
        placeholder="Search opportunities, tags, organisations…"
        trailing={
          <FilterChipButton
            label="Filters"
            activeCount={activeFilterCount}
            onPress={onOpenFilters}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
});
