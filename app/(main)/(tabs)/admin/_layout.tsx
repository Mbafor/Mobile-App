import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { AppHeaderActions } from '@/features/menu/components/AppHeaderActions';
import { useTheme } from '@/hooks/useTheme';

const isWeb = Platform.OS === 'web';

export default function AdminTabLayout() {
  useRequireAdmin();
  const { colors } = useTheme();

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
      <Stack.Screen name="index" options={{ title: 'Opportunities' }} />
      <Stack.Screen
        name="pending"
        options={{ title: 'Pending review', headerBackTitle: 'Back' }}
      />
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
      <Stack.Screen
        name="[id]/review"
        options={{ title: 'Review opportunity', headerBackTitle: 'Pending' }}
      />
    </Stack>
  );
}
