import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';
import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { AppHeaderActions } from '@/features/menu/components/AppHeaderActions';

export default function AdminTabLayout() {
  useRequireAdmin();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
        headerLeft: () => <DrawerToggleButton tintColor={colors.text} />,
        headerRight: () => <AppHeaderActions />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Opportunities' }} />
      <Stack.Screen
        name="create"
        options={{ title: 'Create opportunity', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="paste"
        options={{ title: 'Paste opportunities', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="[id]/edit"
        options={{ title: 'Edit opportunity', headerBackTitle: 'Back' }}
      />
    </Stack>
  );
}
