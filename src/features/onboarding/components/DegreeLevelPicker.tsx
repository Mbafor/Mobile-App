import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { DEGREE_LEVELS } from '@/constants/onboarding';
import { colors, spacing } from '@/constants/theme';

type DegreeLevelPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DegreeLevelPicker({ value, onChange }: DegreeLevelPickerProps) {
  return (
    <View style={styles.wrap}>
      {DEGREE_LEVELS.map((level) => {
        const selected = value === level.value;
        return (
          <Pressable
            key={level.value}
            onPress={() => onChange(level.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{level.label}</Text>
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
