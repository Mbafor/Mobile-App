import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

type CVAddButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function CVAddButton({ label, onPress, disabled }: CVAddButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.disabled]}
      accessibilityRole="button"
    >
      <Text style={styles.plus}>+</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: '#F4F8F5',
  },
  disabled: { opacity: 0.5 },
  plus: { fontSize: 18, fontWeight: '700', color: colors.primary },
  label: { fontSize: 15, fontWeight: '600', color: colors.primary },
});
