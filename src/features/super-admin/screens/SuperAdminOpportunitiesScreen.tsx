import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Text } from '@/components/ui';
import { AdminBarChart } from '@/features/admin/components/AdminBarChart';
import { AdminPieChart } from '@/features/admin/components/AdminPieChart';
import { AdminStatCard } from '@/features/admin/components/AdminStatCard';
import { AdminTopList } from '@/features/admin/components/AdminTopList';
import { useSuperAdminAnalytics } from '@/features/super-admin/hooks/usePlatformAnalytics';
import { FUNDING_TYPE_LABELS } from '@/constants/search-filters';
import { colors, spacing } from '@/constants/theme';
import type { ChartDatum } from '@/features/admin/types/analytics';

function formatFundingChart(data: ChartDatum[]): ChartDatum[] {
  return data.map((item) => ({
    label: FUNDING_TYPE_LABELS[item.label] ?? item.label,
    value: item.value,
  }));
}

export function SuperAdminOpportunitiesScreen() {
  const { data: analytics, isLoading, error, refetch, isRefetching } = useSuperAdminAnalytics();

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
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
    >
      <Text muted style={styles.subtitle}>
        Opportunities analytics & engagement
      </Text>
      {error ? (
        <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load'} />
      ) : null}
      {analytics ? (
        <>
          <View style={styles.grid}>
            <AdminStatCard label="Total posted" value={analytics.opportunities.total} />
            <AdminStatCard label="Closing in 7 days" value={analytics.opportunities.closingIn7Days} />
            <AdminStatCard label="Total saves" value={analytics.engagement.totalSaves} />
            <AdminStatCard label="Applications" value={analytics.engagement.totalApplied} />
          </View>
          <AdminBarChart title="By category" data={analytics.opportunities.byCategory} />
          <AdminPieChart title="By funding" data={formatFundingChart(analytics.opportunities.byFundingType)} />
          <AdminTopList title="Most saved" rows={analytics.engagement.topSaved} />
          <AdminTopList title="Most applied" rows={analytics.engagement.topApplied} />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  centered: { flex: 1, justifyContent: 'center' },
  subtitle: { marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
});
