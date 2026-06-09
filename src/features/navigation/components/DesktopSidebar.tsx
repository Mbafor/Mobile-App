import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
      key: 'browse',
      label: 'Browse',
      icon: 'compass-outline',
      iconActive: 'compass',
      onPress: () => router.push('/(main)/(tabs)/browse-categories' as Href),
      matchPath: '/browse-categories',
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
    { key: 'main', label: 'App', items: mainItems },
    ...(adminItems.length > 0 || superAdminItems.length > 0
      ? [{ key: 'admin', label: 'Admin', items: [...adminItems, ...superAdminItems] }]
      : []),
  ];

  const renderItem = (item: SidebarItem) => {
    const active = item.matchPath ? pathname.includes(item.matchPath) : false;
    return (
      <Pressable
        key={item.key}
        style={webPressableStyle(
          [styles.item, active && styles.itemActive],
          styles.itemHover,
        )}
        onPress={item.onPress}
        accessibilityRole="menuitem"
      >
        <Ionicons
          name={active ? item.iconActive : item.icon}
          size={20}
          color={active ? colors.primary : colors.textMuted}
        />
        <Text
          style={[
            styles.itemLabel,
            getWebFontStyle('medium'),
            active && styles.itemLabelActive,
          ]}
        >
          {item.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.sidebar}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {sections.map((section, si) => (
          <View key={section.key} style={si > 0 ? styles.sectionGap : undefined}>
            <Text style={styles.sectionLabel}>{section.label}</Text>
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
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingBottom: spacing.xl,
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
    fontSize: 11,
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
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: 10,
    marginBottom: spacing.xs,
  },
  itemActive: {
    backgroundColor: `${colors.primary}12`,
  },
  itemHover: { backgroundColor: colors.background },
  itemLabel: {
    fontSize: 15,
    color: colors.text,
  },
  itemLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
}
