import { useRouter, type Href } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';
import { useState } from 'react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { performLogout } from '@/features/auth/utils/perform-logout';
import { confirmAction } from '@/utils/confirm-action';

export function SettingsHomeScreen() {
  const router = useRouter();
  const { userEmail, isAdmin } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    const confirmed = await confirmAction('Log out', 'Are you sure you want to log out?');
    if (!confirmed) return;

    setIsLoggingOut(true);
    const result = await performLogout();
    setIsLoggingOut(false);

    if (!result.ok) {
      Alert.alert('Log out failed', result.error);
    }
  };

  return (
    <Screen>
      <Text variant="title">Settings</Text>
      {userEmail ? (
        <Text muted style={styles.email}>
          {userEmail}
        </Text>
      ) : null}

      {isAdmin ? (
        <Button
          variant="secondary"
          onPress={() => router.push(ROUTES.ADMIN.HOME as Href)}
          style={styles.adminBtn}
        >
          Admin dashboard
        </Button>
      ) : (
        <Text muted variant="caption" style={styles.adminHint}>
          Admin access: set is_admin = true on your profile in Supabase (see docs/SUPABASE_ADMIN_SETUP.md),
          then refresh the app. The Admin tab appears in the bottom bar when enabled.
        </Text>
      )}

      <View style={styles.section}>
        <Button
          variant="secondary"
          onPress={() => router.push(ROUTES.MAIN.SETTINGS_PROFILE as Href)}
        >
          Profile & preferences
        </Button>
        <Button variant="secondary" onPress={() => router.push(ROUTES.MAIN.SETTINGS_PRIVACY as Href)}>
          Privacy
        </Button>
        <Button
          variant="secondary"
          onPress={() => router.push(ROUTES.MAIN.SETTINGS_NOTIFICATIONS as Href)}
        >
          Notification preferences
        </Button>
      </View>

      <Button
        onPress={() => void handleLogout()}
        loading={isLoggingOut}
        disabled={isLoggingOut}
        variant="secondary"
      >
        Log out
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  email: { marginBottom: spacing.md },
  adminBtn: { marginBottom: spacing.md },
  adminHint: { marginBottom: spacing.md, lineHeight: 18 },
  section: { gap: spacing.sm, marginBottom: spacing.lg },
});
