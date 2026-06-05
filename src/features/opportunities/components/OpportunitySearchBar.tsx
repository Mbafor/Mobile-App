import { StyleSheet, View } from 'react-native';

import { FilterChipButton, SearchField } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { useWebDesktop } from '@/hooks/useWebDesktop';

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
  const isDesktop = useWebDesktop();
  return (
    <View style={[styles.wrap, isDesktop && { paddingHorizontal: spacing.md }]}>
      <SearchField
        value={query}
        onChangeText={onChangeQuery}
        placeholder="Search"
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
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
});
