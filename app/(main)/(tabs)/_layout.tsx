import { Ionicons } from '@expo/vector-icons';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { useFocusEffect } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRefreshProfile } from '@/features/auth/hooks/useRefreshProfile';
import { NotificationHeaderButton } from '@/features/notifications/components/NotificationHeaderButton';

type TabIconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, color }: { name: TabIconName; color: string }) {
  return <Ionicons name={name} size={22} color={color} />;
}

export default function MainTabsLayout() {
  const { isAdmin } = useAuth();
  const refreshProfile = useRefreshProfile();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      void refreshProfile();
    }, [refreshProfile]),
  );

  const tabBarHeight = 56 + insets.bottom;
  const tabBarPaddingBottom = Math.max(insets.bottom, spacing.xs);

  return (
    <Tabs
      key={isAdmin ? 'tabs-admin' : 'tabs-user'}
      screenOptions={{
        headerShown: true,
        headerLeft: () => <DrawerToggleButton tintColor={colors.text} />,
        headerRight: () => <NotificationHeaderButton />,
        headerTintColor: colors.text,
        headerRightContainerStyle: { paddingRight: spacing.xs },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: spacing.xs,
          ...(Platform.OS === 'web'
            ? {
                position: 'fixed' as const,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 100,
              }
            : {}),
        },
        tabBarItemStyle: { paddingTop: 4 },
        sceneStyle: { paddingBottom: tabBarHeight },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabIcon name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => <TabIcon name="bookmark-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cv-builder"
        options={{
          title: 'CV Builder',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabIcon name="document-text-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          href: null,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color }) => <TabIcon name="shield-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
