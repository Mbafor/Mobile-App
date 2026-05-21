import { DrawerToggleButton } from '@react-navigation/drawer';
import { useFocusEffect } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { useCallback } from 'react';

import { ROUTES } from '@/constants/routes';
import { colors } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRefreshProfile } from '@/features/auth/hooks/useRefreshProfile';

export default function MainTabsLayout() {
  const { isAdmin } = useAuth();
  const refreshProfile = useRefreshProfile();

  useFocusEffect(
    useCallback(() => {
      void refreshProfile();
    }, [refreshProfile]),
  );

  return (
    <Tabs
      key={isAdmin ? 'tabs-admin' : 'tabs-user'}
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
