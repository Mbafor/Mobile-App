import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { ScreenHeaderBar } from '@/components/layout/ScreenHeaderBar';
import { ROUTES } from '@/constants/routes';
import { SettingsRow } from '@/features/settings/components/SettingsRow';
import { AppearanceSection } from '@/features/settings/components/AppearanceSection';
import { LanguageSection } from '@/features/settings/components/LanguageSection';
import { performLogout } from '@/features/auth/utils/perform-logout';
import { confirmAction } from '@/utils/confirm-action';
import type { ColorScheme } from '@/constants/theme/types';
import { spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Text } from '@/components/ui';

export function SettingsHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    const confirmed = await confirmAction(
      t('settings.home.logoutConfirmTitle'),
      t('settings.home.logoutConfirmMessage'),
    );
    if (!confirmed) return;

    setIsLoggingOut(true);
    const result = await performLogout();
    setIsLoggingOut(false);

    if (!result.ok) {
      Alert.alert(t('settings.home.logoutFailed'), result.error);
    }
  };

  return (
    <View style={styles.root}>
      <ScreenHeaderBar title={t('settings.home.title')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.group}>
          <Text variant="caption" muted style={styles.groupLabel}>
            {t('settings.home.accountSectionLabel')}
          </Text>
          <SettingsRow
            label={t('settings.home.notifications')}
            onPress={() => router.push(ROUTES.MAIN.SETTINGS_NOTIFICATIONS as Href)}
          />
          <SettingsRow
            label={t('settings.home.privacy')}
            onPress={() => router.push(ROUTES.MAIN.SETTINGS_PRIVACY as Href)}
          />
          <SettingsRow
            label={t('settings.home.changePassword')}
            onPress={() => router.push(ROUTES.MAIN.SETTINGS_CHANGE_PASSWORD as Href)}
          />
          <SettingsRow
            label={t('settings.home.support')}
            showDivider={false}
            onPress={() => router.push(ROUTES.MAIN.HELP.INDEX as Href)}
          />
        </View>

        <View style={styles.group}>
          <Text variant="caption" muted style={styles.groupLabel}>
            {t('settings.appearance.sectionLabel')}
          </Text>
          <AppearanceSection />
        </View>

        <View style={styles.group}>
          <Text variant="caption" muted style={styles.groupLabel}>
            {t('settings.language.sectionLabel')}
          </Text>
          <LanguageSection />
        </View>

        <View style={styles.group}>
          <Text variant="caption" muted style={styles.groupLabel}>
            {t('settings.home.accountActionsSectionLabel')}
          </Text>
          <SettingsRow
            label={t('settings.home.logout')}
            destructive
            showChevron={false}
            loading={isLoggingOut}
            onPress={() => void handleLogout()}
          />
          <SettingsRow
            label={t('settings.home.deleteAccount')}
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
