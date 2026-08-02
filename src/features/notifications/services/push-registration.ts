import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { pushTokensApi } from '@/services/api/push-tokens.api';
import type { PushPermissionStatus } from '@/types/domain/notification';

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function getPushPermissionStatus(): Promise<PushPermissionStatus> {
  if (Platform.OS === 'web' || !Device.isDevice) return 'unavailable';

  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export async function requestPushPermission(): Promise<PushPermissionStatus> {
  if (Platform.OS === 'web' || !Device.isDevice) return 'unavailable';

  const current = await getPushPermissionStatus();
  if (current === 'granted') return 'granted';
  if (current === 'denied') return 'denied';

  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

function resolveExpoProjectId(): string | undefined {
  const envId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  if (envId) return envId;

  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId;
}

export async function registerExpoPushToken(userId: string): Promise<{
  token: string | null;
  permission: PushPermissionStatus;
  error?: string;
}> {
  if (Platform.OS === 'web' || !Device.isDevice) {
    return { token: null, permission: 'unavailable' };
  }

  const permission = await requestPushPermission();
  if (permission !== 'granted') {
    return { token: null, permission };
  }

  const projectId = resolveExpoProjectId();
  if (!projectId) {
    const error = 'Missing EAS project ID. Set EXPO_PUBLIC_EAS_PROJECT_ID in .env for remote push.';
    console.warn('[push-registration]', error);
    return { token: null, permission, error };
  }

  try {
    const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResult.data;

    const { error: upsertError } = await pushTokensApi.upsert({
      userId,
      expoPushToken: token,
      platform: Platform.OS,
      deviceId: Constants.sessionId ?? undefined,
    });

    if (upsertError) {
      console.warn('[push-registration] failed to save push token:', upsertError.message);
      return { token: null, permission, error: upsertError.message };
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    return { token, permission };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to register push token';
    console.warn('[push-registration] failed to get push token:', message);
    return { token: null, permission, error: message };
  }
}
