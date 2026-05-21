import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { NotificationListItem } from '@/features/notifications/components/NotificationListItem';
import { PushPermissionBanner } from '@/features/notifications/components/PushPermissionBanner';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { getPushPermissionStatus } from '@/features/notifications/services/push-registration';
import { colors, spacing } from '@/constants/theme';
import type { AppNotification, PushPermissionStatus } from '@/types/domain/notification';

export function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    isRefetching,
    error,
    refetch,
    markRead,
    markAllRead,
    isMarkingRead,
  } = useNotifications();

  const [permission, setPermission] = useState<PushPermissionStatus>('undetermined');

  useEffect(() => {
    void getPushPermissionStatus().then(setPermission);
  }, []);

  const handlePress = useCallback(
    async (item: AppNotification) => {
      if (!item.readAt) {
        await markRead(item.id);
      }
      if (item.opportunityId) {
        router.push({
          pathname: '/(main)/opportunity/[id]',
          params: { id: item.opportunityId },
        });
      }
    },
    [markRead, router],
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Text variant="title">Notifications</Text>
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

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyContainer : undefined
        }
        ListEmptyComponent={
          <View style={styles.padded}>
            <Text muted>No notifications yet. We will notify you about matches and deadlines.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <NotificationListItem notification={item} onPress={() => handlePress(item)} />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    gap: spacing.sm,
  },
  bannerWrap: { paddingHorizontal: spacing.md },
  padded: { padding: spacing.md },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
});
