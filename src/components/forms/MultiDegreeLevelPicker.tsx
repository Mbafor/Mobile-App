import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { OPPORTUNITY_DEGREE_OPTIONS } from '@/constants/opportunity-fields';
import { colors, spacing } from '@/constants/theme';

type MultiDegreeLevelPickerProps = {
  values: string[];
  onChange: (values: string[]) => void;
};

export function MultiDegreeLevelPicker({ values, onChange }: MultiDegreeLevelPickerProps) {
  const toggle = (level: string) => {
    onChange(
      values.includes(level) ? values.filter((v) => v !== level) : [...values, level],
    );
  };

  return (
    <View style={styles.wrap}>
      {OPPORTUNITY_DEGREE_OPTIONS.map((level) => {
        const selected = values.includes(level.value);
        return (
          <Pressable
            key={level.value}
            onPress={() => toggle(level.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {level.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.text },
  chipTextSelected: { color: colors.background },
});
