import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

type FilterChipGroupProps<T extends string> = {
  label: string;
  options: readonly T[] | { value: T; label: string }[];
  selected: T[];
  onChange: (selected: T[]) => void;
  single?: boolean;
  formatLabel?: (value: T) => string;
};

export function FilterChipGroup<T extends string>({
  label,
  options,
  selected,
  onChange,
  single = false,
  formatLabel = (v) => v,
}: FilterChipGroupProps<T>) {
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

  return (
    <View style={styles.wrap}>
      <Text variant="caption" muted style={styles.label}>
        {label}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {normalized.map((opt) => {
            const active = selected.includes(opt.value);
            return (
              <Pressable
                key={opt.value}
                onPress={() => toggle(opt.value)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs, marginBottom: spacing.sm },
  label: { paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.md },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.text },
  chipTextActive: { color: colors.background },
});
