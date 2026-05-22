import { useRouter, type Href } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';

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
    <Screen padded={false}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push(ROUTES.MAIN.DASHBOARD as Href)}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text variant="title">Settings</Text>
          <Text muted style={styles.subtitle}>
            Manage your account, privacy, and notification preferences.
          </Text>
        </View>
      </View>

      {userEmail ? (
        <Text muted style={styles.email}>
          Logged in as {userEmail}
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
      ) : null}

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Preferences</Text>
        <View style={styles.section}>
          <Button
            variant="secondary"
            style={styles.fullWidthButton}
            onPress={() => router.push(ROUTES.MAIN.SETTINGS_PROFILE as Href)}
          >
            Profile & preferences
          </Button>
          <Button
            variant="secondary"
            style={styles.fullWidthButton}
            onPress={() => router.push(ROUTES.MAIN.SETTINGS_PRIVACY as Href)}
          >
            Privacy
          </Button>
          <Button
            variant="secondary"
            style={styles.fullWidthButton}
            onPress={() => router.push(ROUTES.MAIN.SETTINGS_NOTIFICATIONS as Href)}
          >
            Notification preferences
          </Button>
        </View>
      </View>

      <Button
        onPress={() => void handleLogout()}
        loading={isLoggingOut}
        disabled={isLoggingOut}
        variant="secondary"
        style={styles.fullWidthButton}
      >
        Log out
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: 0,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: { flex: 1, gap: spacing.xs },
  subtitle: { color: colors.textMuted },
  email: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  adminBtn: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  panel: {
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  panelTitle: { fontWeight: '700', fontSize: 15, color: colors.text },
  section: { gap: spacing.sm },
  fullWidthButton: { width: '100%' },
});
