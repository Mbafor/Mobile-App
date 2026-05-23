import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerLeft: () => <DrawerToggleButton tintColor={colors.text} />,
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Settings', headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: 'Profile & preferences' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy' }} />
      <Stack.Screen name="notifications-prefs" options={{ title: 'Notifications' }} />
    </Stack>
  );
}
