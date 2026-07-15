import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeaderActions } from '@/features/menu/components/AppHeaderActions';
import { useTheme } from '@/hooks/useTheme';

const isWeb = Platform.OS === 'web';

export default function SettingsLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: !isWeb,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
        headerLeft: () => <DrawerToggleButton tintColor={colors.text} />,
        headerRight: () => <AppHeaderActions />,
      }}
    >
      <Stack.Screen name="index" options={{ title: t('settings.home.title') }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="notifications-prefs" options={{ headerShown: false }} />
      <Stack.Screen name="change-password" options={{ headerShown: false }} />
      <Stack.Screen name="delete-account" options={{ headerShown: false }} />
    </Stack>
  );
}
