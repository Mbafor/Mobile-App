import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { EmptyState, ErrorMessage } from '@/components/feedback';
import { Text } from '@/components/ui';
import { OpportunityCard } from '@/features/opportunities/components/OpportunityCard';
import { useSavedOpportunities } from '@/features/opportunities/hooks/useSavedOpportunities';
import { spacing } from '@/constants/theme';
import type { Opportunity } from '@/types/domain/opportunity';

const NUM_COLUMNS = 2;
const GUTTER = spacing.md;
const GAP = spacing.sm;

export function SavedOpportunitiesScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { opportunities, isLoading, isRefetching, error, refetch } = useSavedOpportunities();

  const cardWidth = (width - GUTTER * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

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
      <OpportunityCard
        opportunity={item}
        onPress={handlePress}
        style={{ width: cardWidth, marginRight: 0, marginBottom: GAP }}
      />
    ),
    [handlePress, cardWidth],
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
        numColumns={NUM_COLUMNS}
        renderItem={renderItem}
        columnWrapperStyle={styles.columnWrapper}
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

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    banner: { padding: spacing.md },
    meta: { paddingHorizontal: GUTTER, paddingVertical: spacing.sm },
    columnWrapper: { paddingHorizontal: GUTTER, gap: GAP },
    emptyList: { flexGrow: 1 },
    listContent: { paddingBottom: spacing.lg },
  });
}
