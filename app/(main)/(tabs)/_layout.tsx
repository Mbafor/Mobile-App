import { DrawerToggleButton } from '@react-navigation/drawer';
import { Tabs } from 'expo-router';

import { ROUTES } from '@/constants/routes';
import { colors } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function MainTabsLayout() {
  const { isAdmin } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerLeft: () => <DrawerToggleButton tintColor={colors.text} />,
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Tabs.Screen
        name="settings-tab"
        options={{ title: 'Settings', href: ROUTES.MAIN.SETTINGS }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          href: isAdmin ? undefined : null,
        }}
      />
    </Tabs>
  );
}
