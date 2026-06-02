import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Text } from '@/components/ui';
import { DashboardStatsRow } from '@/features/dashboard/components/DashboardStatsRow';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { OpportunityFiltersPanel } from '@/features/opportunities/components/OpportunityFiltersPanel';
import { OpportunitySearchBar } from '@/features/opportunities/components/OpportunitySearchBar';
import { OpportunitySearchResults } from '@/features/opportunities/components/OpportunitySearchResults';
import { OpportunitySection } from '@/features/opportunities/components/OpportunitySection';
import { useOpportunitySearch } from '@/features/opportunities/hooks/useOpportunitySearch';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { colors, spacing } from '@/constants/theme';
import type { Opportunity } from '@/types/domain/opportunity';

type DashboardSection = {
  key: string;
  title: string;
  data: Opportunity[];
};

export function DashboardScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    resultCount,
    activeFilterCount,
    isLoading: searchLoading,
    isRefetching: searchRefetching,
    error: searchError,
    refetch: refetchSearch,
  } = useOpportunitySearch();

  const {
    recommended,
    recent,
    closingSoon,
    savedCount,
    appliedCount,
    isLoading: dashboardLoading,
    isRefetching: dashboardRefetching,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDashboard();

  const isSearchActive =
    query.trim().length > 0 || activeFilterCount > 0;

  const sections: DashboardSection[] = [
    { key: 'recommended', title: 'Recommended For You', data: recommended },
    { key: 'recent', title: 'Recently Uploaded', data: recent },
    { key: 'closing', title: 'Closing Soon', data: closingSoon },
  ];

  const handleCardPress = useCallback(
    (opportunity: Opportunity) => {
      router.push({
        pathname: '/(main)/opportunity/[id]',
        params: { id: opportunity.id },
      });
    },
    [router],
  );

  const renderSection = useCallback(
    ({ item }: { item: DashboardSection }) => (
      <OpportunitySection
        title={item.title}
        opportunities={item.data}
        onCardPress={handleCardPress}
      />
    ),
    [handleCardPress],
  );

  const handleRefresh = useCallback(() => {
    void refetchSearch();
    void refetchDashboard();
  }, [refetchDashboard, refetchSearch]);

  if (dashboardLoading && !isSearchActive) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.pageContent}>
        <OpportunitySearchBar
          query={query}
          onChangeQuery={setQuery}
          activeFilterCount={activeFilterCount}
          onOpenFilters={() => setFiltersOpen(true)}
        />

        {isSearchActive ? (
          <OpportunitySearchResults
            results={results}
            resultCount={resultCount}
            isLoading={searchLoading}
            isRefetching={searchRefetching}
            error={searchError}
            onRefetch={refetchSearch}
            onPressOpportunity={handleCardPress}
          />
        ) : (
          <FlatList
            data={sections}
            keyExtractor={(item) => item.key}
            renderItem={renderSection}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={dashboardRefetching || searchRefetching}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
            ListHeaderComponent={
              <View style={styles.header}>
                <DashboardStatsRow savedCount={savedCount} appliedCount={appliedCount} />
                {dashboardError ? (
                  <ErrorMessage
                    message={
                      dashboardError instanceof Error
                        ? dashboardError.message
                        : 'Failed to load dashboard'
                    }
                  />
                ) : null}
              </View>
            }
            contentContainerStyle={styles.list}
          />
        )}
      </View>

      <Modal
        visible={filtersOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFiltersOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setFiltersOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <OpportunityFiltersPanel
              filters={filters}
              onChange={setFilters}
              onClose={() => setFiltersOpen(false)}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pageContent: {
    flex: 1,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingBottom: spacing.sm, gap: spacing.xs },
  list: { paddingBottom: spacing.md },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
});
