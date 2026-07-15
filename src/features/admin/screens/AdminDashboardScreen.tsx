import { useRouter, type Href } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { ErrorMessage } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FUNDING_TYPE_LABELS } from '@/constants/search-filters';
import { spacing } from '@/constants/theme';
import { AdminBarChart } from '@/features/admin/components/AdminBarChart';
import { AdminPieChart } from '@/features/admin/components/AdminPieChart';
import { AdminStatCard } from '@/features/admin/components/AdminStatCard';
import { AdminTopList } from '@/features/admin/components/AdminTopList';
import { useAdminAnalytics } from '@/features/admin/hooks/useAdminAnalytics';
import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import type { ChartDatum } from '@/features/admin/types/analytics';

function formatFundingChart(data: ChartDatum[]): ChartDatum[] {
  return data.map((item) => ({
    label: FUNDING_TYPE_LABELS[item.label] ?? item.label,
    value: item.value,
  }));
}

export function AdminDashboardScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { isReady } = useRequireAdmin();
  const { data: analytics, isLoading, error, refetch, isRefetching } = useAdminAnalytics();

  if (!isReady || isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.primary}
          />
        }
      >
        <Text muted style={styles.subtitle}>
          {t('admin.dashboard.subtitle')}
        </Text>

        {error ? (
          <ErrorMessage message={error instanceof Error ? error.message : t('admin.dashboard.failedToLoadAnalytics')} />
        ) : null}

        <View style={styles.actions}>
          <Button onPress={() => router.push(ROUTES.ADMIN.OPPORTUNITIES as Href)}>
            {t('admin.dashboard.actions.manageOpportunities')}
          </Button>
          <Button variant="secondary" onPress={() => router.push(ROUTES.ADMIN.CREATE as Href)}>
            {t('admin.dashboard.actions.createOpportunity')}
          </Button>
          <Button onPress={() => router.push(ROUTES.ADMIN.EVENTS as Href)}>
            {t('events.admin.dashboard.manageEvents')}
          </Button>
          <Button variant="secondary" onPress={() => router.push(ROUTES.ADMIN.EVENT_CREATE as Href)}>
            {t('events.admin.dashboard.createEvent')}
          </Button>
        </View>

        {analytics ? (
          <>
            <Text style={styles.sectionTitle}>{t('admin.dashboard.sections.users')}</Text>
            <View style={styles.statsGrid}>
              <AdminStatCard label={t('admin.dashboard.stats.totalUsers')} value={analytics.users.total} />
              <AdminStatCard label={t('admin.dashboard.stats.newThisWeek')} value={analytics.users.newThisWeek} />
              <AdminStatCard label={t('admin.dashboard.stats.newThisMonth')} value={analytics.users.newThisMonth} />
              <AdminStatCard label={t('admin.dashboard.stats.onboardingDone')} value={analytics.users.onboardingComplete} />
              <AdminStatCard label={t('admin.dashboard.stats.onboardingPending')} value={analytics.users.onboardingIncomplete} />
            </View>

            <Text style={styles.sectionTitle}>{t('admin.dashboard.sections.opportunities')}</Text>
            <View style={styles.statsGrid}>
              <AdminStatCard label={t('admin.dashboard.stats.totalPosted')} value={analytics.opportunities.total} />
              <AdminStatCard label={t('admin.dashboard.stats.closingIn7Days')} value={analytics.opportunities.closingIn7Days} />
            </View>
            <AdminBarChart title={t('admin.dashboard.charts.byCategory')} data={analytics.opportunities.byCategory} />
            <AdminPieChart title={t('admin.dashboard.charts.byCountry')} data={analytics.opportunities.byCountry} />
            <AdminBarChart
              title={t('admin.dashboard.charts.byFundingType')}
              data={formatFundingChart(analytics.opportunities.byFundingType)}
            />

            <Text style={styles.sectionTitle}>{t('admin.dashboard.sections.engagement')}</Text>
            <View style={styles.statsGrid}>
              <AdminStatCard label={t('admin.dashboard.stats.totalSaves')} value={analytics.engagement.totalSaves} />
              <AdminStatCard label={t('admin.dashboard.stats.totalApplied')} value={analytics.engagement.totalApplied} />
            </View>
            <AdminTopList title={t('admin.dashboard.topLists.mostSaved')} items={analytics.engagement.topSaved} />
            <AdminTopList title={t('admin.dashboard.topLists.mostApplied')} items={analytics.engagement.topApplied} />

            <Text style={styles.sectionTitle}>{t('admin.dashboard.sections.notifications')}</Text>
            <View style={styles.statsGrid}>
              <AdminStatCard label={t('admin.dashboard.stats.totalSent')} value={analytics.notifications.totalSent} />
              <AdminStatCard label={t('admin.dashboard.stats.totalUnread')} value={analytics.notifications.totalUnread} />
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.sm },
  subtitle: { marginBottom: spacing.md },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
});
}
