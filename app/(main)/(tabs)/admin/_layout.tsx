import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';
import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { NotificationHeaderButton } from '@/features/notifications/components/NotificationHeaderButton';

export default function AdminTabLayout() {
  useRequireAdmin();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <DrawerToggleButton tintColor={colors.text} />,
        headerRight: () => <NotificationHeaderButton />,
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Admin' }} />
      <Stack.Screen name="opportunities" options={{ title: 'Opportunities' }} />
      <Stack.Screen name="create" options={{ title: 'Create' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit' }} />
    </Stack>
  );
}
