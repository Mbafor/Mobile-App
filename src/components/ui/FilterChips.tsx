import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Pressable, ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { spacing } from '@/constants/theme';

export type FilterChipOption<T extends string> = {
  value: T;
  label: string;
  /** Omit to render a plain chip with no count badge. */
  count?: number;
};

type FilterChipsProps<T extends string> = {
  options: FilterChipOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

/** Shared horizontal pill-chip filter row — the one visual pattern every filter row in the app should use. */
export function FilterChips<T extends string>({ options, selected, onSelect, style }: FilterChipsProps<T>) {
  const styles = useThemedStyles(createStyles);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={[styles.row, style]}
    >
      {options.map((opt) => {
        const active = opt.value === selected;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {opt.label}
              {opt.count !== undefined ? (
                <Text style={[styles.chipCount, active && styles.chipCountActive]}> {opt.count}</Text>
              ) : null}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    // react-native-web's ScrollView defaults to flexGrow: 1 even when horizontal,
    // which makes it balloon to fill the parent column's remaining height. Pin it
    // to its content height instead.
    scroll: { flexGrow: 0, flexShrink: 0 },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 7,
      paddingBottom: spacing.sm,
    },
    chip: {
      flexShrink: 0,
      paddingVertical: 7,
      paddingHorizontal: spacing.sm + 5,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: { fontSize: 12.5, fontWeight: '600', color: colors.textMuted },
    chipTextActive: { color: colors.textOnPrimary },
    chipCount: { opacity: 0.75, color: colors.textMuted },
    chipCountActive: { color: colors.textOnPrimary, opacity: 0.85 },
  });
}
