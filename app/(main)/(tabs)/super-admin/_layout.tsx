import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SuperAdminShell } from '@/features/super-admin/components/SuperAdminShell';
import { useRequireSuperAdmin } from '@/features/super-admin/hooks/useRequireSuperAdmin';
import { AppHeaderActions } from '@/features/menu/components/AppHeaderActions';
import { useTheme } from '@/hooks/useTheme';

const isWeb = Platform.OS === 'web';

export default function SuperAdminLayout() {
  useRequireSuperAdmin();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <SuperAdminShell>
      <Stack
        screenOptions={{
          headerShown: !isWeb,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => <DrawerToggleButton tintColor={colors.text} />,
          headerRight: () => <AppHeaderActions />,
        }}
      >
        <Stack.Screen name="index" options={{ title: t('superAdmin.titles.overview') }} />
        <Stack.Screen name="analytics" options={{ title: t('superAdmin.titles.analytics') }} />
        <Stack.Screen name="admins" options={{ title: t('superAdmin.titles.admins') }} />
        <Stack.Screen name="mentors" options={{ title: t('superAdmin.titles.mentors') }} />
        <Stack.Screen name="mentees" options={{ title: t('superAdmin.titles.mentees') }} />
        <Stack.Screen name="opportunities" options={{ headerShown: false }} />
        <Stack.Screen name="events" options={{ headerShown: false }} />
      </Stack>
    </SuperAdminShell>
  );
}
