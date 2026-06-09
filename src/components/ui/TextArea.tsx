import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import type { ColorScheme } from '@/constants/theme/types';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type TextAreaProps = TextInputProps & {
  minHeight?: number;
};

/** Multiline text field with visible height — use for summaries and descriptions. */
export function TextArea({ style, minHeight = 120, ...props }: TextAreaProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <TextInput
      style={[styles.base, { minHeight }, style]}
      placeholderTextColor={colors.textMuted}
      multiline
      textAlignVertical="top"
      {...props}
    />
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    base: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      fontSize: typography.fontSize.md,
      lineHeight: 22,
      color: colors.text,
      backgroundColor: colors.background,
    },
  });
}
