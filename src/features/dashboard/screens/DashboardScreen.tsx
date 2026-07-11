import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useAppStore } from '@/store/slices/app.slice';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getOAuthDisplayName } from '@/features/auth/utils/oauth-profile-metadata';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { OpportunityFiltersPanel } from '@/features/opportunities/components/OpportunityFiltersPanel';
import { OpportunitySearchBar } from '@/features/opportunities/components/OpportunitySearchBar';
import { OpportunitySearchResults } from '@/features/opportunities/components/OpportunitySearchResults';
import { OpportunitySection } from '@/features/opportunities/components/OpportunitySection';
import { useOpportunitySearch } from '@/features/opportunities/hooks/useOpportunitySearch';
import { env } from '@/config/env';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { useGreeting } from '@/hooks/useGreeting';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import type { Opportunity } from '@/types/domain/opportunity';

type DashboardSection = {
  key: string;
  title: string;
  data: Opportunity[];
};


export function DashboardScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const isDesktop = useWebDesktop();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const greeting = useGreeting();

  const { isSearchVisible, setSearchVisible } = useAppStore();
  const { profile, user } = useAuth();
  const oauthMeta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const userName = profile?.displayName ?? getOAuthDisplayName(oauthMeta) ?? t('common.user');

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
    clearFilters,
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
    menteeCount,
    isApprovedMentor,
  } = useDashboard();

  useEffect(() => {
    if (!isSearchVisible) {
      setQuery('');
      clearFilters();
    }
  }, [isSearchVisible, setQuery, clearFilters]);

  const isWeb = Platform.OS === 'web';

  const isSearchActive =
    isSearchVisible && (query.trim().length > 0 || activeFilterCount > 0);

  const recommendedTitle = isDesktop
    ? t('dashboard.sections.recommendedFull')
    : t('dashboard.sections.recommendedShort');

  const sections: DashboardSection[] = [
    { key: 'recommended', title: recommendedTitle, data: recommended },
    { key: 'recent', title: t('dashboard.sections.recent'), data: recent },
    { key: 'closing', title: t('dashboard.sections.closing'), data: closingSoon },
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

  const handleViewAll = useCallback(() => {
    router.push(ROUTES.MAIN.TABS.BROWSE as any);
  }, [router]);

  const renderSection = useCallback(
    ({ item }: { item: DashboardSection }) => (
      <OpportunitySection
        title={item.title}
        opportunities={item.data}
        onCardPress={handleCardPress}
        onViewAll={item.key === 'recommended' ? handleViewAll : undefined}
      />
    ),
    [handleCardPress, handleViewAll],
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
            <Text style={[styles.pageTitle, getWebFontStyle('bold')]}>{t('dashboard.title')}</Text>
          </Pressable>
        )}

        {isSearchVisible && (
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
              <View style={[styles.listHeader, { paddingHorizontal: isDesktop ? spacing.md : spacing.sm }]}>
                <LinearGradient
                  colors={[colors.surfaceElevated, colors.surface]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroCard}
                >
                  <Text style={styles.heroSubtitle}>{t('dashboard.hero.eyebrow')}</Text>
                  <Text style={styles.heroTitle}>
                    {t(`dashboard.greeting.${greeting}`, { name: userName })}
                  </Text>
                  <Text style={styles.heroSubheadline}>
                    {t('dashboard.hero.subheadline')}
                  </Text>

                  <View style={styles.heroStatsList}>
                    <View style={styles.heroStatItem}>
                      <Ionicons
                        name="briefcase-outline"
                        size={16}
                        color={colors.primary}
                        style={styles.heroStatIcon}
                      />
                      <Text style={styles.heroStatText}>
                        <Text style={styles.heroStatValue}>
                          {dashboardLoading ? '-' : totalOpportunities}
                        </Text>{' '}
                        {t('dashboard.hero.stats.opportunities')}
                      </Text>
                    </View>
                    <View style={styles.heroStatItem}>
                      <Ionicons
                        name="people-outline"
                        size={16}
                        color={colors.primary}
                        style={styles.heroStatIcon}
                      />
                      <Text style={styles.heroStatText}>
                        <Text style={styles.heroStatValue}>
                          {dashboardLoading ? '-' : isApprovedMentor ? menteeCount : mentorsCount}
                        </Text>{' '}
                        {isApprovedMentor ? t('dashboard.hero.stats.mentees') : t('dashboard.hero.stats.mentors')}
                      </Text>
                    </View>
                    <View style={styles.heroStatItem}>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={16}
                        color={colors.primary}
                        style={styles.heroStatIcon}
                      />
                      <Text style={styles.heroStatText}>
                        <Text style={styles.heroStatValue}>
                          {dashboardLoading ? '-' : appliedCount}
                        </Text>{' '}
                        {t('dashboard.hero.stats.applications')}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>

                {dashboardError && (
                  <View style={styles.header}>
                    <ErrorMessage
                      message={
                        dashboardError instanceof Error
                          ? dashboardError.message
                          : t('dashboard.error')
                      }
                    />
                  </View>
                )}
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

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pageContent: {
    flex: 1,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
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
  listHeader: {
    paddingTop: spacing.md,
  },
  heroCard: {
    borderRadius: 16,
    padding: spacing.md + 4,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroSubheadline: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  heroStatsList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  heroStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStatIcon: {
    marginRight: spacing.sm,
    opacity: 0.85,
  },
  heroStatText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  heroStatValue: {
    fontWeight: '700',
    color: colors.text,
  },
  list: { paddingBottom: spacing.md },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
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
}
