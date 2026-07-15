import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

/** Must match DesktopSidebar's logo-box height so the two bottom borders line up. */
export const DESKTOP_HEADER_HEIGHT = 64;

/** Mirrors the matchPath list in DesktopSidebar — kept in sync manually since each item also needs an icon there. */
const CRUMB_ROUTES: { matchPath: string; labelKey: string }[] = [
  { matchPath: '/dashboard', labelKey: 'navigation.tabs.dashboard' },
  { matchPath: '/tracker', labelKey: 'navigation.tabs.tracker' },
  { matchPath: '/browse-categories', labelKey: 'navigation.tabs.browse' },
  { matchPath: '/events', labelKey: 'navigation.tabs.events' },
  { matchPath: '/mentorship', labelKey: 'navigation.tabs.mentorship' },
  { matchPath: '/cv-builder', labelKey: 'navigation.tabs.cvBuilder' },
  { matchPath: '/notifications', labelKey: 'navigation.tabs.notifications' },
  { matchPath: '/settings', labelKey: 'navigation.tabs.settings' },
  { matchPath: '/profile', labelKey: 'navigation.tabs.profile' },
  { matchPath: '/saved', labelKey: 'navigation.tabs.saved' },
  { matchPath: '/super-admin', labelKey: 'navigation.tabs.superAdmin' },
  { matchPath: '/admin', labelKey: 'navigation.tabs.admin' },
  { matchPath: '/help', labelKey: 'help.title' },
];

function useActiveCrumbLabel(): string | null {
  const pathname = usePathname();
  const { t } = useTranslation();
  const match = CRUMB_ROUTES.find((route) => pathname.includes(route.matchPath));
  return match ? t(match.labelKey) : null;
}

function Breadcrumbs() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const activeLabel = useActiveCrumbLabel();

  return (
    <View style={styles.crumbRow}>
      <Text style={styles.crumbParent}>{t('navigation.tabs.home')}</Text>
      {activeLabel ? (
        <>
          <Text style={styles.crumbSeparator}>/</Text>
          <Text style={styles.crumbActive} numberOfLines={1}>
            {activeLabel}
          </Text>
        </>
      ) : null}
    </View>
  );
}

type DesktopHeaderProps = {
  rightSlot?: ReactNode;
};

export function DesktopHeader({ rightSlot }: DesktopHeaderProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.header}>
      <Breadcrumbs />
      <View style={styles.right}>{rightSlot}</View>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    header: {
      height: DESKTOP_HEADER_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    crumbRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flexShrink: 1,
    },
    crumbParent: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textMuted,
    },
    crumbSeparator: {
      fontSize: 14,
      color: colors.textMuted,
    },
    crumbActive: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      flexShrink: 1,
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
    },
  });
}
