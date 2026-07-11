import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
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
import { spacing } from '@/constants/theme';
import type { PushPermissionStatus } from '@/types/domain/notification';

export function NotificationPreferencesSection() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
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
        t('settings.notifications.couldNotSave'),
        e instanceof Error ? e.message : t('settings.notifications.updateFailed', { label }),
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
          t('settings.notifications.couldNotSave'),
          e instanceof Error ? e.message : t('settings.notifications.pushUpdateFailed'),
        );
      }
      return;
    }

    const status = await requestPushPermission();
    setPermission(status);

    if (status === 'unavailable') {
      Alert.alert(
        t('settings.notifications.notAvailableTitle'),
        t('settings.notifications.notAvailableBody'),
      );
      return;
    }

    if (status !== 'granted') {
      Alert.alert(
        t('settings.notifications.permissionRequiredTitle'),
        t('settings.notifications.permissionRequiredBody'),
      );
      await setPreference('pushEnabled', false);
      return;
    }

    await setPreference('pushEnabled', true);
    const result = await registerExpoPushToken(user.id);
    if (result.error) {
      Alert.alert(t('settings.notifications.pushSetupFailed'), result.error);
      await setPreference('pushEnabled', false);
      await pushTokensApi.removeAllForUser(user.id);
    }
  };

  if (isLoading || !preferences) {
    return <Text muted>{t('settings.notifications.loading')}</Text>;
  }

  const pushToggleDisabled = permission === 'unavailable';

  return (
    <View style={styles.wrap}>
      {permission === 'denied' ? (
        <Text muted variant="caption" style={styles.warning}>
          {t('settings.notifications.systemDenied')}
        </Text>
      ) : null}


      <View style={styles.toggleGroup}>
      <PreferenceToggleRow
        label={t('settings.notifications.items.push.label')}
        description={t('settings.notifications.items.push.description')}
        value={preferences.pushEnabled}
        onValueChange={handlePushToggle}
        loading={isSaving}
        disabled={pushToggleDisabled}
      />
      <PreferenceToggleRow
        label={t('settings.notifications.items.newMatches.label')}
        description={t('settings.notifications.items.newMatches.description')}
        value={preferences.newMatches}
        onValueChange={(v) => void handlePreferenceToggle('newMatches', v, 'new matches')}
        loading={isSaving}
      />
      <PreferenceToggleRow
        label={t('settings.notifications.items.deadline.label')}
        description={t('settings.notifications.items.deadline.description')}
        value={preferences.deadlineReminders}
        onValueChange={(v) =>
          void handlePreferenceToggle('deadlineReminders', v, 'deadline reminders')
        }
        loading={isSaving}
      />
      <PreferenceToggleRow
        label={t('settings.notifications.items.saved.label')}
        description={t('settings.notifications.items.saved.description')}
        value={preferences.savedReminders}
        onValueChange={(v) =>
          void handlePreferenceToggle('savedReminders', v, 'saved reminders')
        }
        loading={isSaving}
      />
      <PreferenceToggleRow
        label={t('settings.notifications.items.mentorshipAssignments.label')}
        description={t('settings.notifications.items.mentorshipAssignments.description')}
        value={preferences.mentorshipAssignments}
        onValueChange={(v) =>
          void handlePreferenceToggle('mentorshipAssignments', v, 'mentorship assignments')
        }
        loading={isSaving}
      />
      <PreferenceToggleRow
        label={t('settings.notifications.items.waitingList.label')}
        description={t('settings.notifications.items.waitingList.description')}
        value={preferences.waitingListUpdates}
        onValueChange={(v) =>
          void handlePreferenceToggle('waitingListUpdates', v, 'waiting list')
        }
        loading={isSaving}
      />
      <PreferenceToggleRow
        label={t('settings.notifications.items.session.label')}
        description={t('settings.notifications.items.session.description')}
        value={preferences.sessionReminders}
        onValueChange={(v) =>
          void handlePreferenceToggle('sessionReminders', v, 'session reminders')
        }
        loading={isSaving}
      />
      <PreferenceToggleRow
        label={t('settings.notifications.items.mentorshipMessages.label')}
        description={t('settings.notifications.items.mentorshipMessages.description')}
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

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  wrap: { gap: spacing.xs },
  warning: { marginBottom: spacing.sm },
  toggleGroup: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
  },
});
}
