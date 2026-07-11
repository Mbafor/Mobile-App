import type { ColorScheme } from '@/constants/theme/types';
import { useTheme } from '@/hooks/useTheme';
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
import { Text } from '@/components/ui';
import { AdminBarChart } from '@/features/admin/components/AdminBarChart';
import { AdminPieChart } from '@/features/admin/components/AdminPieChart';
import { AdminStatCard } from '@/features/admin/components/AdminStatCard';
import { AdminTopList } from '@/features/admin/components/AdminTopList';
import { useRequireSuperAdmin } from '@/features/super-admin/hooks/useRequireSuperAdmin';
import { usePlatformAnalyticsQuery } from '@/hooks/use-platform-analytics';
import { FUNDING_TYPE_LABELS } from '@/constants/search-filters';
import { spacing } from '@/constants/theme';
import type { ChartDatum } from '@/features/admin/types/analytics';

function formatFundingChart(data: ChartDatum[]): ChartDatum[] {
  return data.map((item) => ({
    label: FUNDING_TYPE_LABELS[item.label] ?? item.label,
    value: item.value,
  }));
}

export function PlatformAnalyticsPanel() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isReady } = useRequireSuperAdmin();
  const { data: analytics, isLoading, error, refetch, isRefetching } =
    usePlatformAnalyticsQuery(isReady);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
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
      <Text style={styles.pageTitle}>{t('admin.analytics.pageTitle')}</Text>
      <Text muted style={styles.subtitle}>
        {t('admin.analytics.subtitle')}
      </Text>

      {error ? (
        <ErrorMessage
          message={error instanceof Error ? error.message : t('admin.dashboard.failedToLoadAnalytics')}
        />
      ) : null}

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
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.sm },
  pageTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { marginBottom: spacing.md, lineHeight: 22 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
}
