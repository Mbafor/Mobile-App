import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/** True when running in the browser. */
export const isWeb = Platform.OS === 'web';

/**
 * Inter stack — matches @expo-google-fonts/inter when loaded; falls back to link in app/+html.tsx.
 */
export const webFontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  /** CSS fallback stack for inline / pre-load */
  css: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
} as const;

export type WebFontWeight = keyof typeof webFontFamily;

/** Desktop web type scale — mobile keeps values from typography.ts */
export const webTypographyScale = {
  display: {
    fontSize: 52,
    lineHeight: 58,
    letterSpacing: -1,
    fontWeight: '700' as const,
  },
  h1: {
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.5,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.3,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600' as const,
  },
  bodyLg: {
    fontSize: 18,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
  },
  bodySm: {
    fontSize: 14,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    lineHeight: 20,
  },
} as const;

export type WebTextVariant = keyof typeof webTypographyScale;

/** Standard transition for interactive web elements */
export const webTransition: ViewStyle = isWeb
  ? {
      transitionProperty: 'background-color, border-color, color, opacity, transform, box-shadow',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease',
    }
  : {};

export const webCursorPointer: ViewStyle = isWeb ? { cursor: 'pointer' } : {};

/** Elevated card — box-shadow on web, native shadow elsewhere */
export const webCardShadow: ViewStyle = isWeb
  ? {
      boxShadow: '0 1px 2px rgba(15, 32, 24, 0.04), 0 8px 24px rgba(15, 32, 24, 0.06)',
    }
  : {
      shadowColor: '#0F2018',
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    };

export const webCardShadowHover: ViewStyle = isWeb
  ? {
      boxShadow: '0 2px 8px rgba(15, 32, 24, 0.08), 0 16px 40px rgba(15, 32, 24, 0.1)',
    }
  : {};

export const webCardBase: ViewStyle = {
  borderRadius: 16,
  borderWidth: 1,
  overflow: 'hidden',
  ...webCardShadow,
};

/** Inter fontFamily style for Text nodes (web only). */
export function getWebFontStyle(
  weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular',
): TextStyle {
  if (!isWeb) return {};
  return { fontFamily: webFontFamily[weight] };
}

/** Merge web-only styles — returns empty on native */
export function webOnly<T extends object>(styles: T): Partial<T> {
  return isWeb ? styles : {};
}
