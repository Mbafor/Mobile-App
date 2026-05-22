import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';

type TextAreaProps = TextInputProps & {
  minHeight?: number;
};

/** Multiline text field with visible height — use for summaries and descriptions. */
export function TextArea({ style, minHeight = 120, ...props }: TextAreaProps) {
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

const styles = StyleSheet.create({
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
