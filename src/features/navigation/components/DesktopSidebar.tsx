import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter, type Href } from 'expo-router';

import { LanguageQuickSwitch, Text, ThemeQuickSwitch } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { ROUTES } from '@/constants/routes';
import { env } from '@/config/env';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { webPressableStyle } from '@/utils/web/pressable';
import { DESKTOP_HEADER_HEIGHT } from '@/features/navigation/components/DesktopHeader';

const TOGGLE_SIZE = 28;

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
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isSuperAdmin } = useAuth();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const canScrollUp = scrollY > 4;
  const canScrollDown =
    contentHeight > 0 && containerHeight > 0 && scrollY + containerHeight < contentHeight - 4;

  const mainItems: SidebarItem[] = [
    {
      key: 'home',
      label: t('navigation.tabs.home'),
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
      label: t('navigation.tabs.dashboard'),
      icon: 'grid-outline',
      iconActive: 'grid',
      onPress: () => router.push(ROUTES.MAIN.DASHBOARD as Href),
      matchPath: '/dashboard',
    },
    {
      key: 'tracker',
      label: t('navigation.tabs.tracker'),
      icon: 'clipboard-outline',
      iconActive: 'clipboard',
      onPress: () => router.push('/(main)/(tabs)/tracker' as Href),
      matchPath: '/tracker',
    },
    {
      key: 'browse',
      label: t('navigation.tabs.browse'),
      icon: 'compass-outline',
      iconActive: 'compass',
      onPress: () => router.push('/(main)/(tabs)/browse-categories' as Href),
      matchPath: '/browse-categories',
    },
    {
      key: 'events',
      label: t('navigation.tabs.events'),
      icon: 'calendar-outline',
      iconActive: 'calendar',
      onPress: () => router.push(ROUTES.MAIN.EVENTS as Href),
      matchPath: '/events',
    },
    {
      key: 'mentorship',
      label: t('navigation.tabs.mentorship'),
      icon: 'people-outline',
      iconActive: 'people',
      onPress: () => router.push(ROUTES.MAIN.MENTORSHIP as Href),
      matchPath: '/mentorship',
    },
    {
      key: 'cv-builder',
      label: t('navigation.tabs.cvBuilder'),
      icon: 'document-text-outline',
      iconActive: 'document-text',
      onPress: () => router.push(ROUTES.MAIN.CV_BUILDER.DASHBOARD as Href),
      matchPath: '/cv-builder',
    },
    {
      key: 'notifications',
      label: t('navigation.tabs.notifications'),
      icon: 'notifications-outline',
      iconActive: 'notifications',
      onPress: () => router.push(ROUTES.MAIN.NOTIFICATIONS as Href),
      matchPath: '/notifications',
    },
    {
      key: 'profile',
      label: t('navigation.tabs.profile'),
      icon: 'person-outline',
      iconActive: 'person',
      onPress: () => router.push(ROUTES.MAIN.DRAWER.PROFILE as Href),
      matchPath: '/profile',
    },
    {
      key: 'settings',
      label: t('navigation.tabs.settings'),
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
          label: t('navigation.tabs.admin'),
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
          label: t('navigation.tabs.superAdmin'),
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
      label: t('navigation.sections.main'),
      items: [
        mainItems.find((i) => i.key === 'home')!,
        mainItems.find((i) => i.key === 'dashboard')!,
        {
          key: 'saved',
          label: t('navigation.tabs.saved'),
          icon: 'bookmark-outline',
          iconActive: 'bookmark',
          onPress: () => router.push(ROUTES.MAIN.SAVED as Href),
          matchPath: '/saved',
        },
        mainItems.find((i) => i.key === 'browse')!,
        mainItems.find((i) => i.key === 'events')!,
      ],
    },
    {
      key: 'career',
      label: t('navigation.sections.careerTools'),
      items: [
        mainItems.find((i) => i.key === 'tracker')!,
        mainItems.find((i) => i.key === 'mentorship')!,
        mainItems.find((i) => i.key === 'cv-builder')!,
      ],
    },
    {
      key: 'account',
      label: t('navigation.sections.account'),
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
            label: t('navigation.sections.administration'),
            items: [...adminItems, ...superAdminItems],
          },
        ]
      : []),
  ];

  const renderItem = (item: SidebarItem) => {
    const active = item.matchPath ? pathname.includes(item.matchPath) : false;

    return (
      <View key={item.key} style={[styles.itemRow, active && styles.itemActive]}>
        <Pressable
          style={webPressableStyle(
            [styles.itemMain, collapsed && styles.itemMainCollapsed],
            styles.itemHover,
          )}
          onPress={item.onPress}
          accessibilityRole="menuitem"
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
      </View>
    );
  };

  return (
    <View style={[styles.sidebar, collapsed && styles.sidebarCollapsed]}>
      <View style={styles.logoBox}>
        <Image
          source={
            collapsed
              ? require('@/assets/images/sec_logo.png')
              : isDark
                ? require('@/assets/images/white_logo.png')
                : require('@/assets/images/main_logo.png')
          }
          style={collapsed ? styles.logoImgCollapsed : styles.logoImg}
          resizeMode="contain"
        />
      </View>

      <Pressable
        style={webPressableStyle(styles.toggleButton, styles.toggleButtonHover)}
        onPress={() => setCollapsed((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={collapsed ? t('navigation.sidebar.expand') : t('navigation.sidebar.collapse')}
      >
        <Ionicons
          name={collapsed ? 'chevron-forward' : 'chevron-back'}
          size={14}
          color={colors.textMuted}
        />
      </Pressable>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        onContentSizeChange={(_w, h) => setContentHeight(h)}
        onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
        scrollEventThrottle={16}
      >
        {sections.map((section, si) => (
          <View key={section.key} style={si > 0 ? styles.sectionGap : undefined}>
            {!collapsed && <Text style={styles.sectionLabel}>{section.label}</Text>}
            {section.items.map(renderItem)}
          </View>
        ))}
      </ScrollView>

      <View style={styles.scrollButtons}>
        <Pressable
          onPress={() =>
            scrollRef.current?.scrollTo({ y: Math.max(0, scrollY - 120), animated: true })
          }
          disabled={!canScrollUp}
          style={[styles.scrollBtn, !canScrollUp && styles.scrollBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel={t('navigation.sidebar.scrollUp')}
        >
          <Ionicons name="chevron-up" size={13} color={colors.textMuted} />
        </Pressable>
        <Pressable
          onPress={() =>
            scrollRef.current?.scrollTo({ y: scrollY + 120, animated: true })
          }
          disabled={!canScrollDown}
          style={[styles.scrollBtn, !canScrollDown && styles.scrollBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel={t('navigation.sidebar.scrollDown')}
        >
          <Ionicons name="chevron-down" size={13} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.quickSwitchRow}>
        <ThemeQuickSwitch compact={collapsed} />
        <LanguageQuickSwitch compact={collapsed} />
      </View>
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
    position: 'relative',
  },
  sidebarCollapsed: {
    width: 72,
  },
  logoBox: {
    height: DESKTOP_HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoImg: {
    // Capped to fit inside the existing 64px-tall logo box — a literal 3x (120px)
    // would either overflow the box or force the header/nav bar taller.
    width: 56,
    height: 56,
  },
  logoImgCollapsed: {
    width: 48,
    height: 48,
  },
  // Floating circular badge that straddles the sidebar's right border.
  toggleButton: {
    position: 'absolute',
    top: '50%',
    right: -(TOGGLE_SIZE / 2),
    marginTop: -(TOGGLE_SIZE / 2),
    width: TOGGLE_SIZE,
    height: TOGGLE_SIZE,
    borderRadius: TOGGLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleButtonHover: { backgroundColor: colors.surface },
  scroll: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  sectionGap: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sectionLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
    paddingHorizontal: spacing.sm + 2,
    paddingBottom: spacing.xs,
  },
  // ── Item row ──────────────────────────────────────────────────────────────
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 2,
    overflow: 'hidden',
  },
  itemActive: {
    backgroundColor: `${colors.primary}12`,
  },
  itemMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
  },
  itemMainCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  itemHover: { backgroundColor: colors.surface },
  itemLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  itemLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  // ── Theme / language quick switches ─────────────────────────────────────
  quickSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs + 2,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  // ── Scroll buttons ────────────────────────────────────────────────────────
  scrollButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs + 2,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  scrollBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollBtnDisabled: {
    opacity: 0.3,
  },
});
}
