import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { webPressableStyle } from '@/utils/web/pressable';
import type { MentorshipNavItem } from '@/features/mentorship/components/shared/MentorshipDrawerNav';

type MentorshipTabNavProps = {
  items: MentorshipNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  /** 'horizontal' = top tab strip (desktop). 'bottom' = bottom tab bar (mobile). */
  mode: 'horizontal' | 'bottom';
};

export function MentorshipTabNav({ items, activeId, onSelect, mode }: MentorshipTabNavProps) {
  const insets = useSafeAreaInsets();

  if (mode === 'horizontal') {
    return (
      <View style={styles.hBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hTabs}
        >
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <Pressable
                key={item.id}
                style={webPressableStyle(
                  [styles.hTab, active && styles.hTabActive],
                  styles.hTabHover,
                )}
                onPress={() => onSelect(item.id)}
                accessibilityRole="tab"
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={active ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.hTabLabel, active && styles.hTabLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  const bottomPad = Platform.OS !== 'web' ? Math.max(insets.bottom, spacing.xs) : spacing.xs;

  return (
    <View style={[styles.bBar, { paddingBottom: bottomPad }]}>
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <Pressable
            key={item.id}
            style={styles.bTab}
            onPress={() => onSelect(item.id)}
            accessibilityRole="tab"
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={active ? colors.primary : colors.textMuted}
            />
            <Text
              style={[styles.bTabLabel, active && styles.bTabLabelActive]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // ─── Horizontal (desktop top strip) ───────────────────────────────────────
  hBar: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    gap: spacing.xs,
  },
  hTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  hTabActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}0D`,
  },
  hTabHover: { backgroundColor: colors.surface },
  hTabLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  hTabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  // ─── Bottom (mobile tab bar) ───────────────────────────────────────────────
  bBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
  },
  bTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  bTabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textMuted,
    textAlign: 'center',
  },
  bTabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
