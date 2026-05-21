import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { AppNotification } from '@/types/domain/notification';

export async function presentLocalPush(notification: AppNotification): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted') return false;

  await Notifications.scheduleNotificationAsync({
    identifier: notification.dedupeKey,
    content: {
      title: notification.title,
      body: notification.body,
      data: {
        notificationId: notification.id,
        opportunityId: notification.opportunityId,
        type: notification.type,
      },
    },
    trigger: null,
  });

  return true;
}

export async function setAppBadgeCount(count: number) {
  if (Platform.OS === 'web') return;
  await Notifications.setBadgeCountAsync(count);
}
