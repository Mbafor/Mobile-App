import { Ionicons } from '@expo/vector-icons';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingHelpButton } from '@/features/help/components/FloatingHelpButton';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useRefreshProfile } from '@/features/auth/hooks/useRefreshProfile';
import { AppHeaderActions } from '@/features/menu/components/AppHeaderActions';
import { DesktopWebNavigation, DesktopSidebar, DesktopFooter } from '@/features/navigation/components';
import { useIsWeb, useWebDesktop } from '@/hooks/useWebDesktop';

type TabIconName = keyof typeof Ionicons.glyphMap;

type TabBarIconProps = { color: string; focused: boolean; size: number };

function tabBarIcon(outline: TabIconName, filled: TabIconName) {
  return ({ color, focused, size }: TabBarIconProps) => (
    <Ionicons name={focused ? filled : outline} size={size} color={color} />
  );
}

export default function MainTabsLayout() {
  const { isAdmin, isSuperAdmin } = useAuth();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const refreshProfile = useRefreshProfile();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isWeb = useIsWeb();
  const isWebDesktop = useWebDesktop();

  useFocusEffect(
    useCallback(() => {
      void refreshProfile();
    }, [refreshProfile]),
  );

  const tabBarHeight = 65 + insets.bottom;
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
        sceneStyle: {
          backgroundColor: colors.background,
        },
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
        name="browse-categories"
        options={{
          title: 'Browse',
          headerTitle: 'Browse by Category',
          tabBarIcon: tabBarIcon('grid-outline', 'grid'),
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
    if (isWebDesktop) {
      return (
        <View style={styles.webRoot}>
          <DesktopWebNavigation
            brand="Olives Forum"
            rightSlot={<AppHeaderActions />}
          />
          <View style={styles.desktopBody}>
            <DesktopSidebar />
            <View style={styles.desktopContent}>
              <View style={styles.contentMain}>
                {tabs}
                <FloatingHelpButton />
              </View>
              <DesktopFooter />
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.webRoot}>
        <DesktopWebNavigation
          brand="Olives Forum"
          compact
          onMenuToggle={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          rightSlot={<AppHeaderActions />}
        />
        <View style={styles.webContent}>
          {tabs}
          <FloatingHelpButton />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobileRoot}>
      {tabs}
      <FloatingHelpButton />
    </View>
  );
}

function createStyles(colors: import('@/constants/theme/types').ColorScheme) {
  return StyleSheet.create({
    mobileRoot: { flex: 1 },
    webRoot: { flex: 1, backgroundColor: colors.background },
    webContent: { flex: 1 },
    desktopBody: { flex: 1, flexDirection: 'row' },
    desktopContent: { flex: 1, flexDirection: 'column' },
    contentMain: { flex: 1 },
  });
}
