import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';

export default function SettingsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <DrawerToggleButton tintColor={colors.text} />,
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="notifications-prefs" options={{ headerShown: false }} />
      <Stack.Screen name="change-password" options={{ headerShown: false }} />
      <Stack.Screen name="delete-account" options={{ headerShown: false }} />
    </Stack>
  );
}
