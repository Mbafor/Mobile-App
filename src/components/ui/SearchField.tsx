import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/constants/theme';

type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
  /** Google Docs–style pill search on grey fill. */
  variant?: 'default' | 'docs';
  /** Optional trailing control (e.g. Filters button). */
  trailing?: ReactNode;
  autoFocus?: boolean;
};

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search…',
  onClear,
  style,
  variant = 'default',
  trailing,
  autoFocus,
}: SearchFieldProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const showClear = value.length > 0;
  const isDocs = variant === 'docs';

  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.field, isDocs && styles.fieldDocs]}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.icon} />
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
        />
        {showClear ? (
          <Pressable
            onPress={() => (onClear ? onClear() : onChangeText(''))}
            hitSlop={8}
            style={styles.clearBtn}
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
        {trailing}
      </View>
    </View>
  );
}

type FilterChipButtonProps = {
  label: string;
  activeCount?: number;
  onPress: () => void;
};

export function FilterChipButton({ label, activeCount = 0, onPress }: FilterChipButtonProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const active = activeCount > 0;
  return (
    <Pressable
      onPress={onPress}
      style={styles.filterBtn}
      accessibilityLabel={`${label}${active ? ` (${activeCount} active)` : ''}`}
      hitSlop={8}
    >
      <Ionicons
        name={active ? "options" : "options-outline"}
        size={20}
        color={active ? colors.primary : colors.textMuted}
      />
    </Pressable>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.background,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    minHeight: 48,
  },
  icon: { marginRight: spacing.xs },
  input: {
    flex: 1,
    borderWidth: 0,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: 'transparent',
  },
  clearBtn: { padding: spacing.xs },
  filterBtn: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  fieldDocs: {
    backgroundColor: '#F1F3F4',
    borderColor: 'transparent',
    borderRadius: 24,
    minHeight: 44,
  },
});
}
