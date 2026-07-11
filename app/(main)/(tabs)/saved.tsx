import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui';
import { EmptyState, ErrorMessage } from '@/components/feedback';
import { SavedOpportunityListRow } from '@/features/opportunities/components/SavedOpportunityListRow';
import { useTrackerOpportunities } from '@/features/opportunities/hooks/useTrackerOpportunities';
import { filterTrackerItems } from '@/features/opportunities/utils/filter-tracker';
import { EMPTY_TRACKER_FILTERS, type TrackerStage, type TrackerFilters } from '@/types/domain/tracker';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';

export default function SavedScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const { items, isLoading, isRefetching, error, refetch } = useTrackerOpportunities();

  const savedItems = useMemo(() => {
    const filters: TrackerFilters = { ...EMPTY_TRACKER_FILTERS, stages: ['saved' as TrackerStage] };
    return filterTrackerItems(items, '', filters).map((i) => i.opportunity);
  }, [items]);

  const handlePress = (opportunity: { id: string }) => {
    router.push(ROUTES.MAIN.opportunity(opportunity.id));
  };

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
            message={error instanceof Error ? error.message : t('opportunities.saved.loadError')}
          />
        </View>
      ) : null}

      <FlatList
        data={savedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SavedOpportunityListRow opportunity={item} onPress={handlePress} />
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
            {t('opportunities.saved.count', { count: savedItems.length })}
          </Text>
        }
        ListEmptyComponent={
          <EmptyState
            title={t('opportunities.saved.empty.title')}
            description={t('opportunities.saved.empty.description')}
          />
        }
        contentContainerStyle={
          savedItems.length === 0 ? styles.emptyList : styles.listContent
        }
      />
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingBottom: spacing.md },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    banner: { padding: spacing.md },
    meta: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    emptyList: { flexGrow: 1 },
    listContent: { paddingBottom: spacing.md },
  });
}
