import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { usePathname, useRouter, type Href } from 'expo-router';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { ROUTES } from '@/constants/routes';
import { env } from '@/config/env';
import { webPressableStyle } from '@/utils/web/pressable';

type SidebarItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  matchPath?: string;
};

export function DesktopSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const items: SidebarItem[] = [
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
  ];

  return (
    <View style={styles.sidebar}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {items.map((item) => {
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
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
