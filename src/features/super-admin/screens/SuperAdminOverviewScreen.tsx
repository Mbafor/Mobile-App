import { useQuery } from '@tanstack/react-query';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Text } from '@/components/ui';
import { AdminStatCard } from '@/features/admin/components/AdminStatCard';
import { queryKeys } from '@/constants/query-keys';
import { spacing } from '@/constants/theme';
import { superAdminApi } from '@/services/api';

export function SuperAdminOverviewScreen() {
  const styles = useThemedStyles(createStyles);
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.superAdmin.overview,
    queryFn: async () => {
      const result = await superAdminApi.getOverview();
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });

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
        Quick snapshot. Open Analytics for full charts, users, engagement, and notifications.
      </Text>
      {error ? (
        <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load'} />
      ) : null}
      {data ? (
        <>
          <Text style={styles.section}>Mentorship</Text>
          <View style={styles.grid}>
            <AdminStatCard label="Approved mentors" value={data.mentors.approved} />
            <AdminStatCard label="Pending mentors" value={data.mentors.pending} />
            <AdminStatCard label="Active mentorships" value={data.mentorships.active} />
            <AdminStatCard label="Waiting list" value={data.waitingList} />
          </View>
          <Text style={styles.section}>Platform</Text>
          <View style={styles.grid}>
            <AdminStatCard label="Total users" value={data.users} />
            <AdminStatCard label="Opportunity admins" value={data.admins} />
            <AdminStatCard label="Active opportunities" value={data.opportunities.active} />
            <AdminStatCard label="Pending push" value={data.notifications.pendingPush} />
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  subtitle: { marginBottom: spacing.md },
  section: { fontWeight: '700', fontSize: 16, marginTop: spacing.md, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
}
