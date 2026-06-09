import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import type { ColorScheme } from '@/constants/theme/types';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';

export function Input(props: TextInputProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { style, ...rest } = props;

  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor={colors.textMuted}
      {...rest}
    />
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: spacing.md,
      fontSize: typography.fontSize.md,
      color: colors.text,
      backgroundColor: colors.background,
    },
  });
}
