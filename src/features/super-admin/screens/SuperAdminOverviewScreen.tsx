import { useQuery } from '@tanstack/react-query';
import { useRouter, type Href } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ErrorMessage } from '@/components/feedback';
import { Button, Text } from '@/components/ui';
import { AdminStatCard } from '@/features/admin/components/AdminStatCard';
import { queryKeys } from '@/constants/query-keys';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';
import { superAdminApi } from '@/services/api';

export function SuperAdminOverviewScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
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
        {t('superAdmin.overview.subtitle')}
      </Text>
      {error ? (
        <ErrorMessage message={error instanceof Error ? error.message : t('superAdmin.overview.failedToLoad')} />
      ) : null}

      <View style={styles.actions}>
        <Button onPress={() => router.push(ROUTES.SUPER_ADMIN.EVENTS as Href)}>
          {t('events.admin.dashboard.manageEvents')}
        </Button>
        <Button variant="secondary" onPress={() => router.push(ROUTES.SUPER_ADMIN.EVENT_CREATE as Href)}>
          {t('events.admin.dashboard.createEvent')}
        </Button>
      </View>

      {data ? (
        <>
          <Text style={styles.section}>{t('superAdmin.overview.sections.mentorship')}</Text>
          <View style={styles.grid}>
            <AdminStatCard label={t('superAdmin.overview.stats.approvedMentors')} value={data.mentors.approved} />
            <AdminStatCard label={t('superAdmin.overview.stats.pendingMentors')} value={data.mentors.pending} />
            <AdminStatCard label={t('superAdmin.overview.stats.activeMentorships')} value={data.mentorships.active} />
            <AdminStatCard label={t('superAdmin.overview.stats.waitingList')} value={data.waitingList} />
          </View>
          <Text style={styles.section}>{t('superAdmin.overview.sections.platform')}</Text>
          <View style={styles.grid}>
            <AdminStatCard label={t('superAdmin.overview.stats.totalUsers')} value={data.users} />
            <AdminStatCard label={t('superAdmin.overview.stats.opportunityAdmins')} value={data.admins} />
            <AdminStatCard label={t('superAdmin.overview.stats.activeOpportunities')} value={data.opportunities.active} />
            <AdminStatCard label={t('superAdmin.overview.stats.pendingPush')} value={data.notifications.pendingPush} />
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
  subtitle: { marginBottom: spacing.md },
  section: { fontWeight: '700', fontSize: 16, marginTop: spacing.md, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
});
}
