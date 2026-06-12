import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import type { ColorScheme } from '@/constants/theme/types';
import { spacing, typography, webTransition } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import { webPressableStyle } from '@/utils/web/pressable';

type ButtonProps = PropsWithChildren<
  Omit<PressableProps, 'style'> & {
    variant?: 'primary' | 'secondary' | 'ghost';
    loading?: boolean;
    fullWidth?: boolean;
    textStyle?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;
  }
>;

export function Button({
  children,
  onPress,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  textStyle,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isDisabled = disabled || loading;
  const isDesktopWeb = useWebDesktop();

  const pressableStyle = webPressableStyle(
    [
      styles.base,
      isDesktopWeb && styles.baseDesktop,
      fullWidth && styles.fullWidth,
      variant === 'primary' && styles.primary,
      variant === 'secondary' && styles.secondary,
      variant === 'ghost' && styles.ghost,
      isDisabled && styles.disabled,
      style,
    ],
    !isDisabled && Platform.OS === 'web'
      ? [
          variant === 'primary' && { backgroundColor: colors.primary },
          variant === 'secondary' && { backgroundColor: colors.background },
          variant === 'ghost' && { backgroundColor: `${colors.primary}0c` },
        ]
      : undefined,
  );

  return (
    <Pressable onPress={onPress} disabled={isDisabled} style={pressableStyle} {...props}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.textOnPrimary : colors.primary}
        />
      ) : (
        <Text
          style={[
            styles.label,
            Platform.OS === 'web' && getWebFontStyle('semibold'),
            isDesktopWeb && styles.labelDesktop,
            variant === 'primary' && styles.labelPrimary,
            variant === 'secondary' && styles.labelSecondary,
            variant === 'ghost' && styles.labelGhost,
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    base: {
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.md,
      borderRadius: 8,
      alignItems: 'center',
      minHeight: 48,
      justifyContent: 'center',
      ...webTransition,
    },
    baseDesktop: {
      borderRadius: 10,
      paddingHorizontal: spacing.lg,
      minHeight: 44,
    },
    fullWidth: { alignSelf: 'stretch', width: '100%' },
    primary: { backgroundColor: colors.primary },
    secondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    ghost: { backgroundColor: 'transparent' },
    disabled: { opacity: 0.5 },
    label: { fontSize: typography.fontSize.md, fontWeight: '600' },
    labelDesktop: {
      fontSize: typography.fontSize.sm,
      letterSpacing: 0.1,
    },
    labelPrimary: { color: colors.textOnPrimary },
    labelSecondary: { color: colors.text },
    labelGhost: { color: colors.primary },
  });
}
