import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter, type Href } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';

type NavItem = {
  href: Href;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  segment: string;
};

const NAV: NavItem[] = [
  { href: ROUTES.SUPER_ADMIN.HOME as Href, label: 'Overview', icon: 'grid-outline', segment: 'super-admin/index' },
  {
    href: ROUTES.SUPER_ADMIN.ANALYTICS as Href,
    label: 'Analytics',
    icon: 'stats-chart-outline',
    segment: 'analytics',
  },
  { href: ROUTES.SUPER_ADMIN.ADMINS as Href, label: 'Admins', icon: 'shield-outline', segment: 'admins' },
  { href: ROUTES.SUPER_ADMIN.MENTORS as Href, label: 'Mentors', icon: 'school-outline', segment: 'mentors' },
  { href: ROUTES.SUPER_ADMIN.MENTEES as Href, label: 'Mentees', icon: 'people-outline', segment: 'mentees' },
  {
    href: ROUTES.SUPER_ADMIN.OPPORTUNITIES as Href,
    label: 'Opportunities',
    icon: 'briefcase-outline',
    segment: 'opportunities',
  },
];

export function SuperAdminShell({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const showSidebar = width >= 768;

  return (
    <View style={styles.root}>
      {showSidebar ? (
        <View style={styles.sidebar}>
          <Text variant="title" style={styles.brand}>
            Super Admin
          </Text>
          {NAV.map((item) => {
            const active =
              item.segment === 'super-admin/index'
                ? pathname.endsWith('/super-admin') || pathname.endsWith('/super-admin/index')
                : pathname.includes(item.segment);
            return (
              <Pressable
                key={item.label}
                style={[styles.navItem, active && styles.navItemActive]}
                onPress={() => router.push(item.href)}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={active ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <View style={styles.main}>
        {!showSidebar ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mobileNav}>
            {NAV.map((item) => {
              const active =
              item.segment === 'super-admin/index'
                ? pathname.endsWith('/super-admin') || pathname.endsWith('/super-admin/index')
                : pathname.includes(item.segment);
              return (
                <Pressable
                  key={item.label}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => router.push(item.href)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
  sidebar: {
    width: 220,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.surface,
  },
  brand: { fontSize: 18, fontWeight: '700', marginBottom: spacing.md },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  navItemActive: { backgroundColor: colors.background },
  navLabel: { fontSize: 14, color: colors.text },
  navLabelActive: { color: colors.primary, fontWeight: '600' },
  main: { flex: 1 },
  mobileNav: {
    maxHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
    backgroundColor: colors.background,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: colors.background },
  content: { flex: 1 },
});
