import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';

export function Input(props: TextInputProps) {
  return <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
});
