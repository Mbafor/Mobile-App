import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/constants/theme';
import { cvDocsTheme } from '@/features/cv-builder/constants/cv-docs-theme';
import { useHideMainTabBar } from '@/features/cv-builder/hooks/useHideMainTabBar';

type TabIconName = keyof typeof Ionicons.glyphMap;

type TabBarIconProps = { color: string; focused: boolean; size: number };

function tabBarIcon(outline: TabIconName, filled: TabIconName) {
  return ({ color, focused, size }: TabBarIconProps) => (
    <Ionicons name={focused ? filled : outline} size={size} color={color} />
  );
}

export default function CVHubTabsLayout() {
  const insets = useSafeAreaInsets();
  useHideMainTabBar();

  const tabBarHeight = 56 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
        tabBarStyle: {
          backgroundColor: cvDocsTheme.barBg,
          borderTopColor: cvDocsTheme.divider,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: Math.max(insets.bottom, spacing.xs),
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
        sceneContainerStyle: { backgroundColor: cvDocsTheme.pageBg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: tabBarIcon('grid-outline', 'grid'),
        }}
      />
      <Tabs.Screen
        name="tips"
        options={{
          title: 'Tips',
          tabBarIcon: tabBarIcon('bulb-outline', 'bulb'),
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          title: 'Templates',
          tabBarIcon: tabBarIcon('color-palette-outline', 'color-palette'),
        }}
      />
      <Tabs.Screen
        name="preview"
        options={{
          title: 'Preview',
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Sections',
          tabBarIcon: tabBarIcon('list-outline', 'list'),
        }}
      />
    </Tabs>
  );
}
