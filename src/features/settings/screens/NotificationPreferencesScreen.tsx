import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Text } from '@/components/ui';
import { PreferenceToggleRow } from '@/features/settings/components/PreferenceToggleRow';
import { useNotificationPreferences } from '@/features/notifications/hooks/useNotificationPreferences';
import {
  getPushPermissionStatus,
  requestPushPermission,
  registerExpoPushToken,
} from '@/features/notifications/services/push-registration';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { pushTokensApi } from '@/services/api/push-tokens.api';
import { spacing } from '@/constants/theme';
import type { PushPermissionStatus } from '@/types/domain/notification';

export function NotificationPreferencesScreen() {
  const { user } = useAuth();
  const { preferences, isLoading, setPreference, isSaving } = useNotificationPreferences();
  const [permission, setPermission] = useState<PushPermissionStatus>('undetermined');

  useEffect(() => {
    void getPushPermissionStatus().then(setPermission);
  }, []);

  const handlePushToggle = async (enabled: boolean) => {
    if (!user?.id) return;

    if (!enabled) {
      await setPreference('pushEnabled', false);
      await pushTokensApi.removeAllForUser(user.id);
      return;
    }

    const status = await requestPushPermission();
    setPermission(status);

    if (status === 'unavailable') {
      Alert.alert(
        'Not available',
        'Push notifications require a physical device with a development or production build.',
      );
      return;
    }

    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Enable notifications in your device settings to receive push alerts.',
      );
      await setPreference('pushEnabled', false);
      return;
    }

    await setPreference('pushEnabled', true);
    const result = await registerExpoPushToken(user.id);
    if (result.error) {
      Alert.alert('Push setup failed', result.error);
      await setPreference('pushEnabled', false);
      await pushTokensApi.removeAllForUser(user.id);
    }
  };

  if (isLoading || !preferences) {
    return (
      <Screen>
        <Text variant="title">Notification preferences</Text>
        <Text muted>Loading…</Text>
      </Screen>
    );
  }

  const pushToggleDisabled = permission === 'unavailable';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="title">Notification preferences</Text>
        <Text muted style={styles.intro}>
          Control push alerts and reminder types. In-app history is always available in the
          Notifications tab.
        </Text>

        {permission === 'denied' ? (
          <Text muted variant="caption" style={styles.warning}>
            System notifications are denied. Turn them on in device settings to use push.
          </Text>
        ) : null}

        {permission === 'unavailable' ? (
          <Text muted variant="caption" style={styles.warning}>
            Push is not available on this device or platform (use a physical phone with a dev build).
          </Text>
        ) : null}

        <View style={styles.section}>
          <PreferenceToggleRow
            label="Push notifications"
            description="Receive alerts on this device"
            value={preferences.pushEnabled}
            onValueChange={handlePushToggle}
            loading={isSaving}
            disabled={pushToggleDisabled}
          />
          <PreferenceToggleRow
            label="New matching opportunities"
            description="When a new listing matches your interests"
            value={preferences.newMatches}
            onValueChange={(v) => setPreference('newMatches', v)}
            loading={isSaving}
          />
          <PreferenceToggleRow
            label="Deadline reminders"
            description="3 days before an opportunity closes"
            value={preferences.deadlineReminders}
            onValueChange={(v) => setPreference('deadlineReminders', v)}
            loading={isSaving}
          />
          <PreferenceToggleRow
            label="Saved opportunity reminders"
            description="1 day before a saved opportunity deadline"
            value={preferences.savedReminders}
            onValueChange={(v) => setPreference('savedReminders', v)}
            loading={isSaving}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md, paddingBottom: spacing.xl },
  intro: { marginBottom: spacing.sm },
  warning: { marginBottom: spacing.sm },
  section: { gap: spacing.xs },
});
