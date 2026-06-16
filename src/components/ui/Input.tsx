import type { ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import type { ColorScheme } from '@/constants/theme/types';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type InputProps = TextInputProps & { leftIcon?: ReactNode };

export function Input({ leftIcon, style, ...rest }: InputProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (leftIcon) {
    return (
      <View style={[styles.iconWrapper, rest.multiline && styles.iconWrapperMultiline]}>
        <View style={[styles.iconLeft, rest.multiline && styles.iconLeftMultiline]}>{leftIcon}</View>
        <TextInput
          style={[styles.inputInner, style]}
          placeholderTextColor={colors.textMuted}
          {...rest}
        />
      </View>
    );
  }

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
    iconWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    iconWrapperMultiline: {
      alignItems: 'flex-start',
    },
    iconLeft: {
      paddingLeft: spacing.md,
      paddingRight: spacing.sm,
      paddingTop: 0,
    },
    iconLeftMultiline: {
      paddingTop: spacing.md,
    },
    inputInner: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingRight: spacing.md,
      fontSize: typography.fontSize.md,
      color: colors.text,
    },
  });
}
