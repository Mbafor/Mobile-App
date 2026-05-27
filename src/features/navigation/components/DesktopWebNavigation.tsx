import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, spacing, webTransition } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { webPressableStyle } from '@/utils/web/pressable';

export type DesktopNavItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
};

type DesktopWebNavigationProps = {
  brand: string;
  items: DesktopNavItem[];
  onMenuToggle: () => void;
  rightSlot?: ReactNode;
  /** Hide center tab pills — used on mobile web (nav moves to drawer). */
  compact?: boolean;
  onGoHome?: () => void;
};

export function DesktopWebNavigation({
  brand,
  items,
  onMenuToggle,
  rightSlot,
  compact = false,
  onGoHome,
}: DesktopWebNavigationProps) {
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <View style={[styles.left, compact && styles.leftCompact]}>
          <Pressable
            onPress={onMenuToggle}
            style={webPressableStyle(styles.menuButton, styles.menuButtonHover)}
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu-outline" size={20} color={colors.text} />
          </Pressable>
          {onGoHome ? (
            <Pressable
              onPress={onGoHome}
              style={webPressableStyle(styles.homeButton, styles.menuButtonHover)}
              accessibilityLabel="Back to home page"
            >
              <Ionicons name="arrow-back-outline" size={20} color={colors.text} />
            </Pressable>
          ) : null}
          <Text style={[styles.brand, getWebFontStyle('bold')]} numberOfLines={1}>
            {brand}
          </Text>
        </View>

        {!compact ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.nav}
            style={styles.navScroll}
          >
            {items.map((item) => (
              <Pressable
                key={item.key}
                onPress={item.onPress}
                style={webPressableStyle(
                  [styles.item, item.active && styles.itemActive],
                  styles.itemHover,
                )}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={item.active ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.itemLabel,
                    getWebFontStyle('semibold'),
                    item.active && styles.itemLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.compactHint}>
            <Text style={styles.compactHintText} muted>
              Menu
            </Text>
          </View>
        )}

        <View style={styles.right}>{rightSlot}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...webTransition,
  },
  row: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 140,
    flexShrink: 1,
  },
  leftCompact: {
    minWidth: 0,
    flex: 1,
  },
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
  homeButton: {
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
  navScroll: { flex: 1, minWidth: 0 },
  nav: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  compactHint: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  compactHintText: {
    fontSize: 12,
  },
  item: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  itemActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  itemHover: Platform.OS === 'web' ? { backgroundColor: colors.background } : {},
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  itemLabelActive: {
    color: colors.primary,
  },
  right: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexShrink: 0,
  },
});
