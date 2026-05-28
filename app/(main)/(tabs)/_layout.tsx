import { Ionicons } from '@expo/vector-icons';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { Tabs, useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/constants/theme';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRefreshProfile } from '@/features/auth/hooks/useRefreshProfile';
import { AppHeaderActions } from '@/features/menu/components/AppHeaderActions';
import { DesktopWebNavigation } from '@/features/navigation/components';
import { useMainTabNavItems } from '@/features/navigation/hooks/useMainTabNavItems';
import { useIsWeb, useWebDesktop, useWebMobile } from '@/hooks/useWebDesktop';

type TabIconName = keyof typeof Ionicons.glyphMap;

type TabBarIconProps = { color: string; focused: boolean; size: number };

function tabBarIcon(outline: TabIconName, filled: TabIconName) {
  return ({ color, focused, size }: TabBarIconProps) => (
    <Ionicons name={focused ? filled : outline} size={size} color={color} />
  );
}

export default function MainTabsLayout() {
  const { isAdmin, isSuperAdmin } = useAuth();
  const refreshProfile = useRefreshProfile();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const isWeb = useIsWeb();
  const isWebDesktop = useWebDesktop();
  const isWebMobile = useWebMobile();
  const webNavItems = useMainTabNavItems();

  useFocusEffect(
    useCallback(() => {
      void refreshProfile();
    }, [refreshProfile]),
  );

  const tabBarHeight = 56 + insets.bottom;
  const tabBarPaddingBottom = Math.max(insets.bottom, spacing.xs);

  const tabs = (
    <Tabs
      key={`tabs-${isSuperAdmin ? 'sa' : ''}${isAdmin ? 'admin' : ''}`}
      screenOptions={{
        headerShown: !isWeb,
        headerLeft: () => <DrawerToggleButton tintColor={colors.text} />,
        headerRight: () => <AppHeaderActions />,
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
          ...(isWeb ? { display: 'none' as const } : {}),
        },
        tabBarItemStyle: { paddingTop: 4 },
        sceneContainerStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: tabBarIcon('home-outline', 'home'),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Tracker',
          headerTitle: 'My Tracker',
          tabBarIcon: tabBarIcon('clipboard-outline', 'clipboard'),
        }}
      />
      <Tabs.Screen
        name="mentorship"
        options={{
          title: 'Mentorship',
          headerTitle: 'Mentorship',
          tabBarIcon: tabBarIcon('people-outline', 'people'),
        }}
      />
      <Tabs.Screen
        name="cv-builder"
        options={{
          title: 'CV Builder',
          headerShown: false,
          tabBarIcon: tabBarIcon('document-text-outline', 'document-text'),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          href: isWeb ? '/(main)/(tabs)/notifications' : null,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          href: isAdmin ? undefined : null,
          headerShown: false,
          tabBarIcon: tabBarIcon('shield-outline', 'shield'),
        }}
      />
      <Tabs.Screen
        name="super-admin"
        options={{
          title: 'Super Admin',
          href: isSuperAdmin ? undefined : null,
          headerShown: false,
          tabBarIcon: tabBarIcon('planet-outline', 'planet'),
        }}
      />
    </Tabs>
  );

  if (isWeb) {
    return (
      <View style={styles.webRoot}>
        <DesktopWebNavigation
          brand="Olives Forum"
          items={webNavItems}
          compact={isWebMobile}
          onMenuToggle={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          onGoHome={!isWebMobile ? () => router.push(ROUTES.LANDING as Href) : undefined}
          rightSlot={<AppHeaderActions />}
        />
        <View style={styles.webContent}>{tabs}</View>
      </View>
    );
  }

  return tabs;
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webContent: {
    flex: 1,
  },
});
