import { useRouter, type Href } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Image } from 'expo-image';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { confirmAction } from '@/utils/confirm-action';

import { ErrorMessage } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { useAdminOpportunities, usePendingOpportunities } from '@/features/admin/hooks/useAdminOpportunities';
import { useDeleteOpportunityMutation } from '@/features/admin/hooks/useAdminOpportunityMutations';
import { formatDeadline } from '@/utils/formatting';

export type OpportunityListRoutes = {
  create: Href;
  paste: Href;
  edit: (id: string) => Href;
  pending?: Href;
};

type OpportunityListScreenProps = {
  routes: OpportunityListRoutes;
  title?: string;
  subtitle?: string;
};

export function OpportunityListScreen({
  routes,
  title,
  subtitle,
}: OpportunityListScreenProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: opportunities, isLoading, error, refetch, isRefetching } = useAdminOpportunities();
  const { data: pending } = usePendingOpportunities();
  const pendingCount = pending?.pages.reduce((sum, p) => sum + p.items.length, 0) ?? 0;
  const deleteMutation = useDeleteOpportunityMutation();

  const confirmDelete = async (id: string, oppTitle: string) => {
    const confirmed = await confirmAction(
      t('admin.opportunityList.deleteConfirmTitle'),
      t('admin.opportunityList.deleteConfirmMessage', { title: oppTitle }),
    );
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
    } catch (e) {
      Alert.alert(
        t('admin.opportunityList.deleteFailedTitle'),
        e instanceof Error ? e.message : t('admin.opportunityList.deleteFailedMessage'),
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{title ?? t('admin.opportunityList.homeTitle')}</Text>
        <Text muted style={styles.heroSub}>
          {subtitle ?? t('admin.opportunityList.homeSubtitle')}
        </Text>
        <View style={styles.heroActions}>
          <Button variant="secondary" onPress={() => router.push(routes.paste)}>
            {t('admin.opportunityList.pasteJson')}
          </Button>
          <Button onPress={() => router.push(routes.create)}>{t('admin.opportunityList.createNew')}</Button>
        </View>
        {routes.pending && pendingCount > 0 ? (
          <Pressable
            style={styles.pendingBanner}
            onPress={() => routes.pending && router.push(routes.pending)}
          >
            <Text style={styles.pendingBannerText}>
              {t('admin.opportunityList.pendingBanner', { count: pendingCount })}
            </Text>
            <Text style={styles.pendingBannerLink}>{t('admin.opportunityList.reviewLink')}</Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.padded}>
          <ErrorMessage
            message={error instanceof Error ? error.message : t('admin.opportunityList.failedToLoad')}
          />
        </View>
      ) : (
        <FlatList
          data={opportunities ?? []}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text muted style={styles.padded}>
              {t('admin.opportunityList.emptyList')}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumb} contentFit="cover" />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Text style={styles.thumbLetter}>{item.organization.charAt(0)}</Text>
                </View>
              )}
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text muted>{item.organization}</Text>
                <Text variant="caption" muted style={styles.deadline}>
                  {t('admin.opportunityList.deadline', { date: formatDeadline(item.deadline) })}
                </Text>
              </View>
              <View style={styles.rowActions}>
                <Pressable onPress={() => router.push(routes.edit(item.id))}>
                  <Text style={styles.link}>{t('admin.opportunityList.edit')}</Text>
                </Pressable>
                <Pressable onPress={() => void confirmDelete(item.id, item.title)}>
                  <Text style={styles.danger}>{t('admin.opportunityList.delete')}</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  hero: {
    padding: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  heroTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  heroSub: { lineHeight: 20, marginBottom: spacing.sm },
  heroActions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' },
  pendingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    marginTop: spacing.xs,
  },
  pendingBannerText: { fontSize: 13, color: colors.primary, fontWeight: '500', flex: 1 },
  pendingBannerLink: { fontSize: 13, color: colors.primary, fontWeight: '700' },
  padded: { padding: spacing.md },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  thumbLetter: { fontSize: 20, fontWeight: '700', color: colors.textMuted },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { fontWeight: '600', fontSize: 16 },
  deadline: { marginTop: 2 },
  rowActions: { justifyContent: 'center', gap: spacing.sm, alignItems: 'flex-end' },
  link: { color: colors.primary, fontWeight: '600' },
  danger: { color: colors.error, fontWeight: '600' },
});
}
