import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing, webTransition } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { webPressableStyle } from '@/utils/web/pressable';

/** Kept for backward compat — used by useMainTabNavItems and AppDrawerContent. */
export type DesktopNavItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
};

type DesktopWebNavigationProps = {
  brand: string;
  /** When provided, a hamburger button is shown that calls this. Omit for desktop (sidebar handles it). */
  onMenuToggle?: () => void;
  rightSlot?: ReactNode;
  /** Compact mode for narrow viewports — expands left section to fill available width. */
  compact?: boolean;
};

export function DesktopWebNavigation({
  brand,
  onMenuToggle,
  rightSlot,
  compact = false,
}: DesktopWebNavigationProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        {/* Brand — flush left */}
        <View style={[styles.left, compact && styles.leftCompact]}>
          {onMenuToggle ? (
            <Pressable
              onPress={onMenuToggle}
              style={webPressableStyle(styles.menuButton, styles.menuButtonHover)}
              accessibilityLabel="Open menu"
            >
              <Ionicons name="menu-outline" size={20} color={colors.text} />
            </Pressable>
          ) : null}
          <Text style={[styles.brand, getWebFontStyle('bold')]} numberOfLines={1}>
            {brand}
          </Text>
        </View>

        {/* Push actions to far right */}
        <View style={styles.spacer} />

        {/* Actions — flush right */}
        <View style={styles.right}>{rightSlot}</View>
      </View>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
    ...webTransition,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  leftCompact: {
    flex: 1,
  },
  spacer: { flex: 1 },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  menuButtonHover: Platform.OS === 'web' ? { backgroundColor: colors.background } : {},
  brand: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  right: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexShrink: 0,
  },
});
}
