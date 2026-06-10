import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { usePathname, useRouter, type Href } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';
import { webPressableStyle } from '@/utils/web/pressable';

type NavItem = {
  href: Href;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  segment: string;
};

const NAV: NavItem[] = [
  {
    href: ROUTES.SUPER_ADMIN.HOME as Href,
    label: 'Overview',
    icon: 'grid-outline',
    segment: 'super-admin/index',
  },
  {
    href: ROUTES.SUPER_ADMIN.ANALYTICS as Href,
    label: 'Analytics',
    icon: 'stats-chart-outline',
    segment: 'analytics',
  },
  {
    href: ROUTES.SUPER_ADMIN.ADMINS as Href,
    label: 'Admins',
    icon: 'shield-outline',
    segment: 'admins',
  },
  {
    href: ROUTES.SUPER_ADMIN.MENTORS as Href,
    label: 'Mentors',
    icon: 'school-outline',
    segment: 'mentors',
  },
  {
    href: ROUTES.SUPER_ADMIN.MENTEES as Href,
    label: 'Mentees',
    icon: 'people-outline',
    segment: 'mentees',
  },
  {
    href: ROUTES.SUPER_ADMIN.OPPORTUNITIES as Href,
    label: 'Opportunities',
    icon: 'briefcase-outline',
    segment: 'opportunities',
  },
];

function isActive(item: NavItem, pathname: string): boolean {
  if (item.segment === 'super-admin/index') {
    return pathname.endsWith('/super-admin') || pathname.endsWith('/super-admin/index');
  }
  return pathname.includes(item.segment);
}

export function SuperAdminShell({ children }: PropsWithChildren) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.root}>
      {/* Horizontal tab bar — matches MentorshipTabNav / CVHubTopNav style */}
      <View style={styles.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {NAV.map((item) => {
            const active = isActive(item, pathname);
            return (
              <Pressable
                key={item.label}
                style={Platform.OS === 'web'
                  ? webPressableStyle(
                      [styles.tab, active && styles.tabActive],
                      styles.tabHover,
                    )
                  : [styles.tab, active && styles.tabActive]}
                onPress={() => router.push(item.href)}
                accessibilityRole="tab"
              >
                <Ionicons
                  name={item.icon}
                  size={15}
                  color={active ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Page content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.background,
  },

  // ─── Tab bar ──────────────────────────────────────────────────────────────
  tabBar: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    gap: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabHover: { backgroundColor: colors.surface },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },

  // ─── Content ──────────────────────────────────────────────────────────────
  content: { flex: 1 },
});
}
