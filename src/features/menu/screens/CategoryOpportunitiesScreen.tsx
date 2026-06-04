import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { EmptyState } from '@/components/feedback';
import { PageHeader } from '@/components/layout/PageHeader';
import { Text } from '@/components/ui';
import { slugToCategory } from '@/constants/browse-categories';
import { colors, spacing } from '@/constants/theme';
import { OpportunityListRow } from '@/features/opportunities/components/OpportunityListRow';
import { useActiveOpportunities } from '@/features/opportunities/hooks/useActiveOpportunities';
import type { Opportunity } from '@/types/domain/opportunity';

function matchesCategory(opportunity: Opportunity, category: string): boolean {
  const normalized = category.trim().toLowerCase();
  if (opportunity.category?.trim().toLowerCase() === normalized) return true;
  return opportunity.tags.some((tag) => tag.trim().toLowerCase() === normalized);
}

export function CategoryOpportunitiesScreen() {
  const router = useRouter();
  const { category: categorySlug } = useLocalSearchParams<{ category: string }>();
  const categoryName = slugToCategory(
    typeof categorySlug === 'string' ? categorySlug : categorySlug?.[0] ?? '',
  );

  const { data, isLoading, isRefetching, refetch } = useActiveOpportunities();

  const results = useMemo(
    () => (data ?? []).filter((o) => matchesCategory(o, categoryName)),
    [categoryName, data],
  );

  const handlePress = useCallback(
    (opportunity: Opportunity) => {
      router.push({
        pathname: '/(main)/opportunity/[id]',
        params: { id: opportunity.id },
      });
    },
    [router],
  );

  if (isLoading) {
    return (
      <View style={styles.root}>
        <PageHeader title={categoryName} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <PageHeader title={categoryName} />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OpportunityListRow opportunity={item} onPress={handlePress} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <Text variant="caption" muted style={styles.meta}>
            {results.length} {results.length === 1 ? 'opportunity' : 'opportunities'}
          </Text>
        }
        ListEmptyComponent={
          <EmptyState
            title="No opportunities"
            description={`Nothing active in ${categoryName} right now. Check back later.`}
          />
        }
        contentContainerStyle={[
          styles.list,
          results.length === 0 && styles.empty,
        ]}
        style={styles.scroll}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  list: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  meta: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textMuted,
  },
  empty: { flexGrow: 1 },
});
