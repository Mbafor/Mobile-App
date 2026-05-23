import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { EmptyState, ErrorMessage } from '@/components/feedback';
import { Text } from '@/components/ui';
import { SavedOpportunityListRow } from '@/features/opportunities/components/SavedOpportunityListRow';
import { useSavedOpportunities } from '@/features/opportunities/hooks/useSavedOpportunities';
import { colors, spacing } from '@/constants/theme';
import type { Opportunity } from '@/types/domain/opportunity';

export function SavedOpportunitiesScreen() {
  const router = useRouter();
  const { opportunities, isLoading, isRefetching, error, refetch } = useSavedOpportunities();

  const handlePress = useCallback(
    (opportunity: Opportunity) => {
      router.push({
        pathname: '/(main)/opportunity/[id]',
        params: { id: opportunity.id },
      });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Opportunity }) => (
      <SavedOpportunityListRow opportunity={item} onPress={handlePress} />
    ),
    [handlePress],
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
          <ErrorMessage
            message={error instanceof Error ? error.message : 'Failed to load saved opportunities'}
          />
        </View>
      ) : null}
      <FlatList
        data={opportunities}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <Text variant="caption" muted style={styles.meta}>
            {opportunities.length} saved {opportunities.length === 1 ? 'opportunity' : 'opportunities'}
          </Text>
        }
        ListEmptyComponent={
          <EmptyState
            title="Nothing saved yet"
            description="Save opportunities from the dashboard or opportunity details to see them here."
          />
        }
        contentContainerStyle={
          opportunities.length === 0 ? styles.emptyList : styles.listContent
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  banner: { padding: spacing.md },
  meta: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  emptyList: { flexGrow: 1 },
  listContent: { paddingBottom: spacing.md },
});
