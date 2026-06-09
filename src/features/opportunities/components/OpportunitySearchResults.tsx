import { useCallback } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { EmptyState, ErrorMessage } from '@/components/feedback';
import { Text } from '@/components/ui';
import { OpportunityListRow } from '@/features/opportunities/components/OpportunityListRow';
import { spacing } from '@/constants/theme';
import type { Opportunity } from '@/types/domain/opportunity';

type OpportunitySearchResultsProps = {
  results: Opportunity[];
  resultCount: number;
  isLoading: boolean;
  isRefetching: boolean;
  error: unknown;
  onRefetch: () => void;
  onPressOpportunity: (opportunity: Opportunity) => void;
};

export function OpportunitySearchResults({
  results,
  resultCount,
  isLoading,
  isRefetching,
  error,
  onRefetch,
  onPressOpportunity,
}: OpportunitySearchResultsProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const renderItem = useCallback(
    ({ item }: { item: Opportunity }) => (
      <OpportunityListRow opportunity={item} onPress={onPressOpportunity} />
    ),
    [onPressOpportunity],
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.banner}>
          <ErrorMessage message={error instanceof Error ? error.message : 'Search failed'} />
        </View>
      ) : null}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefetch}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <Text variant="caption" muted style={styles.resultMeta}>
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </Text>
        }
        ListEmptyComponent={
          <EmptyState
            title="No matches"
            description="Try a different search or adjust your filters."
          />
        }
        contentContainerStyle={results.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  banner: { paddingHorizontal: spacing.md },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultMeta: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  emptyList: { flexGrow: 1 },
});
}
