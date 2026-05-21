import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { Input, Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

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
};

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search…',
  onClear,
  style,
  variant = 'default',
  trailing,
}: SearchFieldProps) {
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
          style={styles.input}
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
      </View>
      {trailing}
    </View>
  );
}

type FilterChipButtonProps = {
  label: string;
  activeCount?: number;
  onPress: () => void;
};

export function FilterChipButton({ label, activeCount = 0, onPress }: FilterChipButtonProps) {
  const active = activeCount > 0;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterBtn, active && styles.filterBtnActive]}
    >
      <Ionicons
        name="options-outline"
        size={16}
        color={active ? colors.background : colors.text}
      />
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
        {active ? ` (${activeCount})` : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 48,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.text },
  filterTextActive: { color: colors.background },
  fieldDocs: {
    backgroundColor: '#F1F3F4',
    borderColor: 'transparent',
    borderRadius: 24,
    minHeight: 44,
  },
});
