import { useRouter, type Href } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { performLogout } from '@/features/auth/utils/perform-logout';

export function SettingsHomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { signOut, isLoading, error } = useAuthActions();

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            const ok = await performLogout(signOut);
            if (!ok) {
              Alert.alert('Log out failed', error ?? 'Please try again.');
            }
          })();
        },
      },
    ]);
  };

  return (
    <Screen>
      <Text variant="title">Settings</Text>
      {profile ? (
        <Text muted style={styles.email}>
          {profile.email}
        </Text>
      ) : null}

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

      <Button onPress={handleLogout} loading={isLoading} disabled={isLoading} variant="secondary">
        Log out
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  email: { marginBottom: spacing.lg },
  section: { gap: spacing.sm, marginBottom: spacing.lg },
});
