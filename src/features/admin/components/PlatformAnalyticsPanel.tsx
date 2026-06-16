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
      <Text style={styles.pageTitle}>Platform analytics</Text>
      <Text muted style={styles.subtitle}>
        Users, opportunities, engagement, and notifications across Voila.
      </Text>

      {error ? (
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to load analytics'}
        />
      ) : null}

      {analytics ? (
        <>
          <Text style={styles.sectionTitle}>Users</Text>
          <View style={styles.statsGrid}>
            <AdminStatCard label="Total users" value={analytics.users.total} />
            <AdminStatCard label="New this week" value={analytics.users.newThisWeek} />
            <AdminStatCard label="New this month" value={analytics.users.newThisMonth} />
            <AdminStatCard label="Onboarding done" value={analytics.users.onboardingComplete} />
            <AdminStatCard label="Onboarding pending" value={analytics.users.onboardingIncomplete} />
          </View>

          <Text style={styles.sectionTitle}>Opportunities</Text>
          <View style={styles.statsGrid}>
            <AdminStatCard label="Total posted" value={analytics.opportunities.total} />
            <AdminStatCard label="Closing in 7 days" value={analytics.opportunities.closingIn7Days} />
          </View>
          <AdminBarChart title="By category" data={analytics.opportunities.byCategory} />
          <AdminPieChart title="By country" data={analytics.opportunities.byCountry} />
          <AdminBarChart
            title="By funding type"
            data={formatFundingChart(analytics.opportunities.byFundingType)}
          />

          <Text style={styles.sectionTitle}>Engagement</Text>
          <View style={styles.statsGrid}>
            <AdminStatCard label="Total saves" value={analytics.engagement.totalSaves} />
            <AdminStatCard label="Total applied" value={analytics.engagement.totalApplied} />
          </View>
          <AdminTopList title="Top 5 most saved" items={analytics.engagement.topSaved} />
          <AdminTopList title="Top 5 most applied" items={analytics.engagement.topApplied} />

          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.statsGrid}>
            <AdminStatCard label="Total sent" value={analytics.notifications.totalSent} />
            <AdminStatCard label="Total unread" value={analytics.notifications.totalUnread} />
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
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
