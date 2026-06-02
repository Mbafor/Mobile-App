import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

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
import { colors, spacing } from '@/constants/theme';
import type { PushPermissionStatus } from '@/types/domain/notification';

export function NotificationPreferencesSection() {
  const { user } = useAuth();
  const { preferences, isLoading, setPreference, isSaving } = useNotificationPreferences();
  const [permission, setPermission] = useState<PushPermissionStatus>('undetermined');

  useEffect(() => {
    void getPushPermissionStatus().then(setPermission);
  }, []);

  const handlePreferenceToggle = async (
    key:
      | 'newMatches'
      | 'deadlineReminders'
      | 'savedReminders'
      | 'mentorshipAssignments'
      | 'waitingListUpdates'
      | 'sessionReminders'
      | 'mentorshipMessages',
    value: boolean,
    label: string,
  ) => {
    try {
      await setPreference(key, value);
    } catch (e) {
      Alert.alert(
        'Could not save',
        e instanceof Error ? e.message : `Failed to update ${label}. Please try again.`,
      );
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (!user?.id) return;

    if (!enabled) {
      try {
        await setPreference('pushEnabled', false);
        await pushTokensApi.removeAllForUser(user.id);
      } catch (e) {
        Alert.alert(
          'Could not save',
          e instanceof Error ? e.message : 'Failed to update push notifications.',
        );
      }
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
    return <Text muted>Loading notification preferences…</Text>;
  }

  const pushToggleDisabled = permission === 'unavailable';

  return (
    <View style={styles.wrap}>
      <Text muted style={styles.intro}>
        Control push alerts and reminder types. In-app history is always available in the
        Notifications tab.
      </Text>

      {permission === 'denied' ? (
        <Text muted variant="caption" style={styles.warning}>
          System notifications are denied. Turn them on in device settings to use push.
        </Text>
      ) : null}


      <View style={styles.toggleGroup}>
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
        onValueChange={(v) => void handlePreferenceToggle('newMatches', v, 'new matches')}
        loading={isSaving}
      />
      <PreferenceToggleRow
        label="Deadline reminders"
        description="3 days before an opportunity closes"
        value={preferences.deadlineReminders}
        onValueChange={(v) =>
          void handlePreferenceToggle('deadlineReminders', v, 'deadline reminders')
        }
        loading={isSaving}
      />
      <PreferenceToggleRow
        label="Saved opportunity reminders"
        description="1 day before a saved opportunity deadline"
        value={preferences.savedReminders}
        onValueChange={(v) =>
          void handlePreferenceToggle('savedReminders', v, 'saved reminders')
        }
        loading={isSaving}
      />
      <PreferenceToggleRow
        label="Mentorship assignments"
        description="When you are matched with a coach or mentee"
        value={preferences.mentorshipAssignments}
        onValueChange={(v) =>
          void handlePreferenceToggle('mentorshipAssignments', v, 'mentorship assignments')
        }
        loading={isSaving}
      />
      <PreferenceToggleRow
        label="Waiting list updates"
        description="Queue position and match availability"
        value={preferences.waitingListUpdates}
        onValueChange={(v) =>
          void handlePreferenceToggle('waitingListUpdates', v, 'waiting list')
        }
        loading={isSaving}
      />
      <PreferenceToggleRow
        label="Session reminders"
        description="24 hours before mentorship sessions"
        value={preferences.sessionReminders}
        onValueChange={(v) =>
          void handlePreferenceToggle('sessionReminders', v, 'session reminders')
        }
        loading={isSaving}
      />
      <PreferenceToggleRow
        label="Mentorship messages"
        description="New chat messages from your coach or mentees"
        value={preferences.mentorshipMessages}
        onValueChange={(v) =>
          void handlePreferenceToggle('mentorshipMessages', v, 'mentorship messages')
        }
        loading={isSaving}
      />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  intro: { marginBottom: spacing.sm, lineHeight: 22 },
  warning: { marginBottom: spacing.sm },
  toggleGroup: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
  },
});
