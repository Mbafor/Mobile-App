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
import { useAdminEvents } from '@/features/admin/hooks/useAdminEvents';
import { useDeleteEventMutation } from '@/features/admin/hooks/useAdminEventMutations';
import { formatEventDateTime } from '@/utils/formatting';

export type EventListRoutes = {
  create: Href;
  edit: (id: string) => Href;
};

type EventListScreenProps = {
  routes: EventListRoutes;
  title?: string;
  subtitle?: string;
};

export function EventListScreen({ routes, title, subtitle }: EventListScreenProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: events, isLoading, error, refetch, isRefetching } = useAdminEvents();
  const deleteMutation = useDeleteEventMutation();

  const confirmDelete = async (id: string, eventTitle: string) => {
    const confirmed = await confirmAction(
      t('events.admin.list.deleteConfirmTitle'),
      t('events.admin.list.deleteConfirmMessage', { title: eventTitle }),
    );
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
    } catch (e) {
      Alert.alert(
        t('events.admin.list.deleteFailedTitle'),
        e instanceof Error ? e.message : t('events.admin.list.deleteFailedMessage'),
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
        <Text style={styles.heroTitle}>{title ?? t('events.admin.list.homeTitle')}</Text>
        <Text muted style={styles.heroSub}>
          {subtitle ?? t('events.admin.list.homeSubtitle')}
        </Text>
        <View style={styles.heroActions}>
          <Button onPress={() => router.push(routes.create)}>{t('events.admin.list.createNew')}</Button>
        </View>
      </View>

      {error ? (
        <View style={styles.padded}>
          <ErrorMessage
            message={error instanceof Error ? error.message : t('events.admin.list.failedToLoad')}
          />
        </View>
      ) : (
        <FlatList
          data={events ?? []}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text muted style={styles.padded}>
              {t('events.admin.list.emptyList')}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumb} contentFit="cover" />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Text style={styles.thumbLetter}>{item.title.charAt(0)}</Text>
                </View>
              )}
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text variant="caption" muted style={styles.eventDate}>
                  {formatEventDateTime(item.eventDate)}
                </Text>
              </View>
              <View style={styles.rowActions}>
                <Pressable onPress={() => router.push(routes.edit(item.id))}>
                  <Text style={styles.link}>{t('events.admin.list.edit')}</Text>
                </Pressable>
                <Pressable onPress={() => void confirmDelete(item.id, item.title)}>
                  <Text style={styles.danger}>{t('events.admin.list.delete')}</Text>
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
  eventDate: { marginTop: 2 },
  rowActions: { justifyContent: 'center', gap: spacing.sm, alignItems: 'flex-end' },
  link: { color: colors.primary, fontWeight: '600' },
  danger: { color: colors.error, fontWeight: '600' },
});
}
