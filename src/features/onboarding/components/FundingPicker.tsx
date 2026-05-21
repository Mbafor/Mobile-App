import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { FUNDING_OPTIONS } from '@/constants/onboarding';
import { colors, spacing } from '@/constants/theme';
import type { FundingPreference } from '@/types/domain/user-preferences';

type FundingPickerProps = {
  value: FundingPreference;
  onChange: (value: FundingPreference) => void;
};

export function FundingPicker({ value, onChange }: FundingPickerProps) {
  return (
    <View style={styles.wrap}>
      {FUNDING_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, color: colors.text },
  chipTextSelected: { color: colors.background },
});
