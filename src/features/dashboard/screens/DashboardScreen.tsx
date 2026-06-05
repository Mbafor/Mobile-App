import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Text } from '@/components/ui';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { OpportunityFiltersPanel } from '@/features/opportunities/components/OpportunityFiltersPanel';
import { OpportunitySearchBar } from '@/features/opportunities/components/OpportunitySearchBar';
import { OpportunitySearchResults } from '@/features/opportunities/components/OpportunitySearchResults';
import { OpportunitySection } from '@/features/opportunities/components/OpportunitySection';
import { useOpportunitySearch } from '@/features/opportunities/hooks/useOpportunitySearch';
import { env } from '@/config/env';
import { colors, spacing } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import type { Opportunity } from '@/types/domain/opportunity';

type DashboardSection = {
  key: string;
  title: string;
  data: Opportunity[];
};

export function DashboardScreen() {
  const router = useRouter();
  const isDesktop = useWebDesktop();
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
    isLoading: dashboardLoading,
    isRefetching: dashboardRefetching,
    error: dashboardError,
    refetch: refetchDashboard,
    totalOpportunities,
    appliedCount,
    mentorsCount,
  } = useDashboard();

  const isWeb = Platform.OS === 'web';
  const showMobileWebStats = isWeb && !isDesktop;

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

  const handleGoHome = useCallback(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = env.LANDING_URL;
    }
  }, []);

  if (dashboardLoading && !isSearchActive) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.pageContent, isDesktop && { paddingHorizontal: spacing.md }]}>
        {isDesktop && (
          <Pressable onPress={handleGoHome} style={styles.titleRow} accessibilityRole="link">
            <Text style={[styles.pageTitle, getWebFontStyle('bold')]}>Dashboard</Text>
          </Pressable>
        )}

        <View
          style={[
            Platform.OS === 'web' && {
              position: 'sticky' as any,
              top: 0,
              zIndex: 10,
              backgroundColor: colors.background,
            },
          ]}
        >
          <OpportunitySearchBar
            query={query}
            onChangeQuery={setQuery}
            activeFilterCount={activeFilterCount}
            onOpenFilters={() => setFiltersOpen(true)}
          />
        </View>

        {showMobileWebStats && !isSearchActive && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Opportunities</Text>
              <Text style={styles.statValue}>{dashboardLoading ? '-' : totalOpportunities}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Applied</Text>
              <Text style={styles.statValue}>{dashboardLoading ? '-' : appliedCount}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Mentors</Text>
              <Text style={styles.statValue}>{dashboardLoading ? '-' : mentorsCount}</Text>
            </View>
          </View>
        )}

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
              dashboardError ? (
                <View style={styles.header}>
                  <ErrorMessage
                    message={
                      dashboardError instanceof Error
                        ? dashboardError.message
                        : 'Failed to load dashboard'
                    }
                  />
                </View>
              ) : null
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
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titleRow: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  header: { paddingBottom: spacing.sm },
  list: { paddingBottom: spacing.md },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
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
