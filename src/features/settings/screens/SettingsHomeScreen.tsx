import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { PageHeader } from '@/components/layout/PageHeader';
import { ROUTES } from '@/constants/routes';
import { SettingsRow } from '@/features/settings/components/SettingsRow';
import { AppearanceSection } from '@/features/settings/components/AppearanceSection';
import { performLogout } from '@/features/auth/utils/perform-logout';
import { confirmAction } from '@/utils/confirm-action';
import type { ColorScheme } from '@/constants/theme/types';
import { spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Text } from '@/components/ui';

export function SettingsHomeScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
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
    <View style={styles.root}>
      <PageHeader title="Settings" onBack={() => router.push(ROUTES.MAIN.DASHBOARD as Href)} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.group}>
          <Text variant="caption" muted style={styles.groupLabel}>
            Appearance
          </Text>
          <AppearanceSection />
        </View>

        <View style={styles.group}>
          <SettingsRow
            label="Notifications"
            onPress={() => router.push(ROUTES.MAIN.SETTINGS_NOTIFICATIONS as Href)}
          />
          <SettingsRow
            label="Privacy"
            onPress={() => router.push(ROUTES.MAIN.SETTINGS_PRIVACY as Href)}
          />
          <SettingsRow
            label="Change Password"
            onPress={() => router.push(ROUTES.MAIN.SETTINGS_CHANGE_PASSWORD as Href)}
          />
          <SettingsRow
            label="Support"
            showDivider={false}
            onPress={() => router.push(ROUTES.MAIN.HELP.INDEX as Href)}
          />
        </View>

        <View style={styles.group}>
          <SettingsRow
            label="Log out"
            destructive
            showChevron={false}
            loading={isLoggingOut}
            onPress={() => void handleLogout()}
          />
          <SettingsRow
            label="Delete Account"
            destructive
            showDivider={false}
            onPress={() => router.push(ROUTES.MAIN.SETTINGS_DELETE_ACCOUNT as Href)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl * 2,
      maxWidth: 1200,
      width: '100%',
      alignSelf: 'center',
    },
    group: {
      marginBottom: spacing.xl,
    },
    groupLabel: {
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
  });
}
