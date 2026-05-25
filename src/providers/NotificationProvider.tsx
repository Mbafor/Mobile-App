import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/constants/query-keys';
import { useNotificationPreferences } from '@/features/notifications/hooks/useNotificationPreferences';
import { useNotificationsRealtime } from '@/features/notifications/hooks/useNotificationsRealtime';
import {
  configureNotificationHandler,
  registerExpoPushToken,
} from '@/features/notifications/services/push-registration';
import { runNotificationSync } from '@/features/notifications/services/notification-sync';
import { navigateFromPushData } from '@/features/notifications/utils/notification-navigation';
import { notificationsApi } from '@/services/api';

configureNotificationHandler();

export function NotificationProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const { preferences } = useNotificationPreferences();
  const syncingRef = useRef(false);

  useNotificationsRealtime(userId);

  useEffect(() => {
    if (!userId || !preferences?.pushEnabled) return;

    void registerExpoPushToken(userId);
  }, [userId, preferences?.pushEnabled]);

  useEffect(() => {
    if (!userId) return;

    const sync = async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      try {
        await runNotificationSync(userId);
        void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(userId) });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.unreadCount(userId),
        });
      } finally {
        syncingRef.current = false;
      }
    };

    void sync();

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') void sync();
    };

    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [
    userId,
    queryClient,
    preferences?.newMatches,
    preferences?.deadlineReminders,
    preferences?.savedReminders,
  ]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const data = response.notification.request.content.data as Record<string, unknown>;

      const notificationId =
        typeof data.notificationId === 'string' ? data.notificationId : undefined;

      if (userId && notificationId) {
        await notificationsApi.markRead(userId, notificationId);
        void queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.unreadCount(userId),
        });
      }

      navigateFromPushData(router, data);
    });

    return () => sub.remove();
  }, [userId, queryClient]);

  return children;
}
