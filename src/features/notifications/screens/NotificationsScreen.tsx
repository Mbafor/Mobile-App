import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { NotificationEmptyState } from '@/features/notifications/components/NotificationEmptyState';
import { NotificationFilterBar } from '@/features/notifications/components/NotificationFilterBar';
import { NotificationSkeletonList } from '@/features/notifications/components/NotificationSkeleton';
import { PushPermissionBanner } from '@/features/notifications/components/PushPermissionBanner';
import { SwipeableNotificationRow } from '@/features/notifications/components/SwipeableNotificationRow';
import { useNotificationEnrichment } from '@/features/notifications/hooks/useNotificationEnrichment';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { getPushPermissionStatus } from '@/features/notifications/services/push-registration';
import {
  filterNotifications,
  groupNotificationsByDate,
} from '@/features/notifications/utils/notification-filters';
import { navigateFromNotification } from '@/features/notifications/utils/notification-navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { colors, spacing } from '@/constants/theme';
import type {
  AppNotification,
  NotificationFilter,
  PushPermissionStatus,
} from '@/types/domain/notification';

export function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;

  const {
    notifications,
    unreadCount,
    isLoading,
    isRefetching,
    error,
    refetch,
    markRead,
    markAllRead,
    deleteNotification,
    isMarkingRead,
  } = useNotifications();

  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [permission, setPermission] = useState<PushPermissionStatus>('undetermined');

  useEffect(() => {
    void getPushPermissionStatus().then(setPermission);
  }, []);

  const filtered = useMemo(
    () => filterNotifications(notifications, filter),
    [notifications, filter],
  );

  const sections = useMemo(() => groupNotificationsByDate(filtered), [filtered]);
  const { data: enrichment } = useNotificationEnrichment(notifications);

  const handlePress = useCallback(
    async (item: AppNotification) => {
      if (!item.readAt) {
        await markRead(item.id);
      }
      navigateFromNotification(router, item);
    },
    [markRead, router],
  );

  const listSections = useMemo(
    () =>
      sections.map((group) => ({
        title: group.label,
        key: group.key,
        data: group.items,
      })),
    [sections],
  );

  if (isLoading) {
    return (
      <Screen padded={false}>
        <View style={styles.header}>
          <Text variant="title">Notifications</Text>
        </View>
        <NotificationSkeletonList />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <View>
          <Text variant="title">Notifications</Text>
          {unreadCount > 0 ? (
            <Text muted variant="caption" style={styles.subtitle}>
              {unreadCount} unread
            </Text>
          ) : null}
        </View>
        {unreadCount > 0 ? (
          <Button
            variant="secondary"
            onPress={() => markAllRead()}
            loading={isMarkingRead}
            disabled={isMarkingRead}
          >
            Mark all read
          </Button>
        ) : null}
      </View>

      <NotificationFilterBar
        active={filter}
        onChange={setFilter}
        unreadCount={unreadCount}
      />

      {permission === 'denied' ? (
        <View style={styles.bannerWrap}>
          <PushPermissionBanner />
        </View>
      ) : null}

      {error ? (
        <View style={styles.padded}>
          <ErrorMessage
            message={error instanceof Error ? error.message : 'Could not load notifications.'}
          />
        </View>
      ) : null}

      <SectionList
        sections={listSections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={
          filtered.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={<NotificationEmptyState filter={filter} />}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text variant="caption" style={styles.sectionTitle}>
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <SwipeableNotificationRow
            notification={item}
            enrichment={enrichment}
            onPress={() => handlePress(item)}
            onMarkRead={() => markRead(item.id)}
            onDelete={() => deleteNotification(item.id)}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  subtitle: { marginTop: 2 },
  bannerWrap: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  padded: { padding: spacing.md },
  emptyContainer: { flexGrow: 1 },
  listContent: { paddingBottom: spacing.xl },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
