import { Pressable, StyleSheet, View } from 'react-native';

import { Input, Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

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
    <View style={styles.searchBar}>
      <Input
        value={query}
        onChangeText={onChangeQuery}
        placeholder="Search title, tags, organization…"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      <Pressable
        style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
        onPress={onOpenFilters}
      >
        <Text style={[styles.filterBtnText, activeFilterCount > 0 && styles.filterBtnTextActive]}>
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  input: { flex: 1 },
  filterBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: colors.text },
  filterBtnTextActive: { color: colors.background },
});
