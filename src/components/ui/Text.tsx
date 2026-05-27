import type { PropsWithChildren } from 'react';
import { Platform, Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native';

import { colors, typography, webTypographyScale, type WebTextVariant } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { useWebDesktop } from '@/hooks/useWebDesktop';

type TextVariant = 'body' | 'title' | 'caption' | WebTextVariant;

type TextProps = RNTextProps &
  PropsWithChildren<{
    variant?: TextVariant;
    muted?: boolean;
    weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  }>;

const MOBILE_VARIANTS = new Set(['body', 'title', 'caption']);

function resolveWebTypeVariant(variant: TextVariant, isDesktopWeb: boolean): WebTextVariant | null {
  if (MOBILE_VARIANTS.has(variant)) return null;
  if (isDesktopWeb) return variant as WebTextVariant;
  if (variant === 'display') return 'h1';
  if (variant === 'h1') return 'h2';
  if (variant === 'h2') return 'h3';
  return variant as WebTextVariant;
}

export function Text({ variant = 'body', muted, weight, style, ...props }: TextProps) {
  const isDesktopWeb = useWebDesktop();
  const webTypeKey = Platform.OS === 'web' ? resolveWebTypeVariant(variant, isDesktopWeb) : null;
  const webVariantStyle = webTypeKey ? webTypographyScale[webTypeKey] : undefined;

  return (
    <RNText
      style={[
        Platform.OS === 'web' && getWebFontStyle(weight ?? 'regular'),
        variant === 'body' && !webVariantStyle && styles.body,
        variant === 'title' && !webVariantStyle && styles.title,
        variant === 'caption' && !webVariantStyle && styles.caption,
        isDesktopWeb && variant === 'title' && !webTypeKey && styles.titleDesktop,
        webVariantStyle,
        muted && styles.muted,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  body: { fontSize: typography.fontSize.md, color: colors.text },
  title: { fontSize: typography.fontSize.xl, color: colors.text },
  titleDesktop: {
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  caption: { fontSize: typography.fontSize.sm, color: colors.textMuted },
  muted: { color: colors.textMuted },
});
