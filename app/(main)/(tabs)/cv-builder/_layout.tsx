import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';
import { NotificationHeaderButton } from '@/features/notifications/components/NotificationHeaderButton';

export default function CVBuilderTabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <DrawerToggleButton tintColor={colors.text} />,
        headerRight: () => <NotificationHeaderButton />,
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'CV Builder' }} />
      <Stack.Screen name="[cvId]" options={{ headerShown: false }} />
    </Stack>
  );
}
