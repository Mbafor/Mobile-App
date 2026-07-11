import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useWebDesktop } from '@/hooks/useWebDesktop';

type TabIconName = keyof typeof Ionicons.glyphMap;

type TabBarIconProps = { color: string; focused: boolean; size: number };

function tabBarIcon(outline: TabIconName, filled: TabIconName) {
  return ({ color, focused, size }: TabBarIconProps) => (
    <Ionicons name={focused ? filled : outline} size={size} color={color} />
  );
}

export default function CVHubTabsLayout() {
  const insets = useSafeAreaInsets();
  const isDesktop = useWebDesktop();
  const { colors, cvDocsTheme } = useTheme();
  const { t } = useTranslation();

  const tabBarHeight = 65 + insets.bottom;

  const tabBarWebStyle = { display: 'none' as const };

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
          ...(Platform.OS === 'web' ? tabBarWebStyle : {}),
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('cvBuilder.tabs.dashboard'),
          tabBarIcon: tabBarIcon('grid-outline', 'grid'),
        }}
      />
      <Tabs.Screen
        name="tips"
        options={{
          title: t('cvBuilder.tabs.tips'),
          tabBarIcon: tabBarIcon('bulb-outline', 'bulb'),
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          title: t('cvBuilder.tabs.templates'),
          tabBarIcon: tabBarIcon('color-palette-outline', 'color-palette'),
        }}
      />
      <Tabs.Screen
        name="preview"
        options={{
          title: t('cvBuilder.tabs.preview'),
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('cvBuilder.tabs.sections'),
          tabBarIcon: tabBarIcon('list-outline', 'list'),
        }}
      />
    </Tabs>
  );
}
