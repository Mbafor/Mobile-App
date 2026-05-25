import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack } from 'expo-router';

import { SuperAdminShell } from '@/features/super-admin/components/SuperAdminShell';
import { useRequireSuperAdmin } from '@/features/super-admin/hooks/useRequireSuperAdmin';
import { NotificationHeaderButton } from '@/features/notifications/components/NotificationHeaderButton';
import { colors, spacing } from '@/constants/theme';

export default function SuperAdminLayout() {
  useRequireSuperAdmin();

  return (
    <SuperAdminShell>
      <Stack
        screenOptions={{
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => <DrawerToggleButton tintColor={colors.text} />,
          headerRight: () => <NotificationHeaderButton />,
          headerRightContainerStyle: { paddingRight: spacing.xs },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Super Admin' }} />
        <Stack.Screen name="mentors" options={{ title: 'Mentors' }} />
        <Stack.Screen name="mentees" options={{ title: 'Mentees' }} />
        <Stack.Screen name="admins" options={{ title: 'Admins' }} />
        <Stack.Screen name="opportunities" options={{ title: 'Opportunities' }} />
      </Stack>
    </SuperAdminShell>
  );
}
