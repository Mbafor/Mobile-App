import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';

export default function HelpLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.text,
        headerBackTitle: 'Help',
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Help & Support',
          headerLeft: () => <DrawerToggleButton tintColor={colors.text} />,
        }}
      />
      <Stack.Screen name="report-bug" options={{ title: 'Report a Bug' }} />
      <Stack.Screen name="feature-request" options={{ title: 'Feature Request' }} />
      <Stack.Screen name="feedback" options={{ title: 'Leave Feedback' }} />
    </Stack>
  );
}
