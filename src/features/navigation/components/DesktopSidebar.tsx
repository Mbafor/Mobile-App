import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { usePathname, useRouter, type Href } from 'expo-router';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { ROUTES } from '@/constants/routes';
import { env } from '@/config/env';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { webPressableStyle } from '@/utils/web/pressable';

type SidebarItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  matchPath?: string;
};

type SidebarSection = {
  key: string;
  label: string;
  items: SidebarItem[];
};

export function DesktopSidebar() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isSuperAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const mainItems: SidebarItem[] = [
    {
      key: 'home',
      label: 'Home',
      icon: 'home-outline',
      iconActive: 'home',
      onPress: () => {
        if (typeof window !== 'undefined') {
          window.location.href = env.LANDING_URL;
        }
      },
    },
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'grid-outline',
      iconActive: 'grid',
      onPress: () => router.push(ROUTES.MAIN.DASHBOARD as Href),
      matchPath: '/dashboard',
    },
    {
      key: 'tracker',
      label: 'Tracker',
      icon: 'clipboard-outline',
      iconActive: 'clipboard',
      onPress: () => router.push('/(main)/(tabs)/tracker' as Href),
      matchPath: '/tracker',
    },
    {
      key: 'browse',
      label: 'Browse',
      icon: 'compass-outline',
      iconActive: 'compass',
      onPress: () => router.push('/(main)/(tabs)/browse-categories' as Href),
      matchPath: '/browse-categories',
    },
    {
      key: 'mentorship',
      label: 'Mentorship',
      icon: 'people-outline',
      iconActive: 'people',
      onPress: () => router.push(ROUTES.MAIN.MENTORSHIP as Href),
      matchPath: '/mentorship',
    },
    {
      key: 'cv-builder',
      label: 'CV Builder',
      icon: 'document-text-outline',
      iconActive: 'document-text',
      onPress: () => router.push(ROUTES.MAIN.CV_BUILDER.DASHBOARD as Href),
      matchPath: '/cv-builder',
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: 'notifications-outline',
      iconActive: 'notifications',
      onPress: () => router.push(ROUTES.MAIN.NOTIFICATIONS as Href),
      matchPath: '/notifications',
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: 'person-outline',
      iconActive: 'person',
      onPress: () => router.push(ROUTES.MAIN.DRAWER.PROFILE as Href),
      matchPath: '/profile',
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: 'settings-outline',
      iconActive: 'settings',
      onPress: () => router.push(ROUTES.MAIN.SETTINGS as Href),
      matchPath: '/settings',
    },
  ];

  const adminItems: SidebarItem[] = isAdmin
    ? [
        {
          key: 'admin',
          label: 'Admin',
          icon: 'shield-outline',
          iconActive: 'shield',
          onPress: () => router.push(ROUTES.ADMIN.HOME as Href),
          matchPath: '/admin',
        },
      ]
    : [];

  const superAdminItems: SidebarItem[] = isSuperAdmin
    ? [
        {
          key: 'super-admin',
          label: 'Super Admin',
          icon: 'planet-outline',
          iconActive: 'planet',
          onPress: () => router.push(ROUTES.SUPER_ADMIN.HOME as Href),
          matchPath: '/super-admin',
        },
      ]
    : [];

  const sections: SidebarSection[] = [
    {
      key: 'main',
      label: 'Main',
      items: [
        mainItems.find((i) => i.key === 'home')!,
        mainItems.find((i) => i.key === 'dashboard')!,
        // Saved uses ROUTES.MAIN.SAVED
        {
          key: 'saved',
          label: 'Saved',
          icon: 'bookmark-outline',
          iconActive: 'bookmark',
          onPress: () => router.push(ROUTES.MAIN.SAVED as Href),
          matchPath: '/saved',
        },
        mainItems.find((i) => i.key === 'browse')!,
      ],
    },
    {
      key: 'career',
      label: 'Career Tools',
      items: [
        mainItems.find((i) => i.key === 'tracker')!,
        mainItems.find((i) => i.key === 'mentorship')!,
        mainItems.find((i) => i.key === 'cv-builder')!,
      ],
    },
    {
      key: 'account',
      label: 'Account',
      items: [
        mainItems.find((i) => i.key === 'notifications')!,
        mainItems.find((i) => i.key === 'profile')!,
        mainItems.find((i) => i.key === 'settings')!,
      ],
    },
    ...(adminItems.length > 0 || superAdminItems.length > 0
      ? [
          {
            key: 'admin',
            label: 'Administration',
            items: [...adminItems, ...superAdminItems],
          },
        ]
      : []),
  ];

  const renderItem = (item: SidebarItem) => {
    const active = item.matchPath ? pathname.includes(item.matchPath) : false;
    return (
      <Pressable
        key={item.key}
        style={webPressableStyle(
          [styles.item, collapsed && styles.itemCollapsed, active && styles.itemActive],
          styles.itemHover,
        )}
        onPress={item.onPress}
        accessibilityRole="menuitem"
        // show native tooltip on web when collapsed
        {...(collapsed ? { title: item.label } : {})}
      >
        <Ionicons
          name={active ? item.iconActive : item.icon}
          size={20}
          color={active ? colors.primary : colors.textMuted}
        />
        {!collapsed && (
          <Text
            style={[
              styles.itemLabel,
              getWebFontStyle('medium'),
              active && styles.itemLabelActive,
            ]}
          >
            {item.label}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.sidebar, collapsed && styles.sidebarCollapsed]}>
      <View style={styles.toggleContainer}>
        <Pressable
          style={webPressableStyle(styles.toggleButton, styles.itemHover)}
          onPress={() => setCollapsed((value) => !value)}
          accessibilityRole="button"
          accessibilityLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Ionicons
            name={collapsed ? 'menu-outline' : 'close-outline'}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {sections.map((section, si) => (
          <View key={section.key} style={si > 0 ? styles.sectionGap : undefined}>
            {!collapsed && <Text style={styles.sectionLabel}>{section.label}</Text>}
            {section.items.map(renderItem)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  sidebar: {
    width: 220,
    flexShrink: 0,
    backgroundColor: colors.background,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingBottom: spacing.xl,
  },
  sidebarCollapsed: {
    width: 72,
  },
  toggleContainer: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
  },
  scroll: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
  },
  sectionGap: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
    paddingHorizontal: spacing.sm + 2,
    paddingBottom: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: 10,
    marginBottom: 2,
  },
  itemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  itemActive: {
    backgroundColor: `${colors.primary}12`,
  },
  itemHover: { backgroundColor: colors.background },
  itemLabel: {
    fontSize: 13,
    color: colors.text,
  },
  itemLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
}
