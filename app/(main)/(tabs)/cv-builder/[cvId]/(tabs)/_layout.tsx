import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/constants/theme';
import { cvDocsTheme } from '@/features/cv-builder/constants/cv-docs-theme';
import { useHideMainTabBar } from '@/features/cv-builder/hooks/useHideMainTabBar';

type TabIconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, color, size }: { name: TabIconName; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
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
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: tabBarHeight,
          paddingBottom: Math.max(insets.bottom, spacing.xs),
          paddingTop: spacing.xs,
          backgroundColor: cvDocsTheme.barBg,
          borderTopColor: cvDocsTheme.divider,
          borderTopWidth: 1,
          ...(Platform.OS === 'web' ? { position: 'fixed' as const, zIndex: 100 } : {}),
        },
        sceneStyle: { paddingBottom: tabBarHeight },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          title: 'Templates',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="tips"
        options={{
          title: 'Tips',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="bulb-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Sections',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="options-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
