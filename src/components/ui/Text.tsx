import type { PropsWithChildren } from 'react';
import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native';

import { colors, typography } from '@/constants/theme';

type TextProps = RNTextProps & PropsWithChildren<{
  variant?: 'body' | 'title' | 'caption';
  muted?: boolean;
}>;

export function Text({ variant = 'body', muted, style, ...props }: TextProps) {
  return (
    <RNText
      style={[
        variant === 'title' && styles.title,
        variant === 'caption' && styles.caption,
        muted && styles.muted,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  title: { fontSize: typography.fontSize.xl, color: colors.text },
  caption: { fontSize: typography.fontSize.sm, color: colors.textMuted },
  muted: { color: colors.textMuted },
});
