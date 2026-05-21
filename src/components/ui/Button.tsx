import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';

type ButtonProps = PropsWithChildren<
  Omit<PressableProps, 'style'> & {
    variant?: 'primary' | 'secondary' | 'ghost';
    loading?: boolean;
    style?: StyleProp<ViewStyle>;
  }
>;

export function Button({
  children,
  onPress,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.background : colors.primary} />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'primary' && styles.labelPrimary,
            variant === 'secondary' && styles.labelSecondary,
            variant === 'ghost' && styles.labelGhost,
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: { backgroundColor: 'transparent' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  label: { fontSize: typography.fontSize.md, fontWeight: '600' },
  labelPrimary: { color: colors.background },
  labelSecondary: { color: colors.text },
  labelGhost: { color: colors.primary },
});
