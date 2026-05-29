import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { SuperAdminShell } from '@/features/super-admin/components/SuperAdminShell';
import { useRequireSuperAdmin } from '@/features/super-admin/hooks/useRequireSuperAdmin';
import { AppHeaderActions } from '@/features/menu/components/AppHeaderActions';
import { colors, spacing } from '@/constants/theme';

const isWeb = Platform.OS === 'web';

export default function SuperAdminLayout() {
  useRequireSuperAdmin();

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
        <Stack.Screen name="index" options={{ title: 'Overview' }} />
        <Stack.Screen name="analytics" options={{ title: 'Analytics' }} />
        <Stack.Screen name="admins" options={{ title: 'Manage admins' }} />
        <Stack.Screen name="mentors" options={{ title: 'Manage mentors' }} />
        <Stack.Screen name="mentees" options={{ title: 'Mentees' }} />
        <Stack.Screen name="opportunities" options={{ headerShown: false }} />
      </Stack>
    </SuperAdminShell>
  );
}
