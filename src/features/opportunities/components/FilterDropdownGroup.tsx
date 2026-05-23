import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

type FilterDropdownGroupProps<T extends string> = {
  label: string;
  options: readonly T[] | { value: T; label: string }[];
  selected: T[];
  onChange: (selected: T[]) => void;
  single?: boolean;
  formatLabel?: (value: T) => string;
};

export function FilterDropdownGroup<T extends string>({
  label,
  options,
  selected,
  onChange,
  single = false,
  formatLabel = (v) => v,
}: FilterDropdownGroupProps<T>) {
  const [open, setOpen] = useState(false);

  const normalized = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: formatLabel(opt) } : opt,
  );

  const toggle = (value: T) => {
    if (single) {
      onChange(selected.includes(value) ? [] : [value]);
      return;
    }
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const summary =
    selected.length === 0
      ? 'All'
      : single
        ? normalized.find((o) => selected.includes(o.value))?.label ?? selected[0]
        : `${selected.length} selected`;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={[styles.trigger, open && styles.triggerOpen]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <View style={styles.triggerCopy}>
          <Text style={styles.triggerLabel}>{label}</Text>
          <Text style={styles.triggerValue} numberOfLines={1}>
            {summary}
          </Text>
        </View>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>

      {open ? (
        <View style={styles.list}>
          {normalized.map((opt) => {
            const active = selected.includes(opt.value);
            return (
              <Pressable
                key={opt.value}
                onPress={() => toggle(opt.value)}
                style={[styles.option, active && styles.optionActive]}
              >
                <Ionicons
                  name={active ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={active ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm, paddingHorizontal: spacing.md },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  triggerOpen: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  triggerCopy: { flex: 1, gap: 2 },
  triggerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  triggerValue: { fontSize: 14, fontWeight: '500', color: colors.text },
  list: {
    marginTop: spacing.xs,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionActive: { backgroundColor: '#E8F0EB' },
  optionText: { flex: 1, fontSize: 14, color: colors.text },
  optionTextActive: { fontWeight: '600', color: colors.primary },
});
