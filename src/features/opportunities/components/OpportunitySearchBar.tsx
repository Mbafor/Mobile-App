import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <View style={[styles.wrap, { paddingHorizontal: isDesktop ? spacing.md : spacing.sm }]}>
      <SearchField
        value={query}
        onChangeText={onChangeQuery}
        placeholder={t('opportunities.search.placeholder')}
        trailing={
          <FilterChipButton
            label={t('opportunities.search.filters')}
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
