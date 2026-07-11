import type {
  ColorScheme,
  CvDocsTheme,
  MentorshipColorScheme,
  ResolvedTheme,
} from '@/constants/theme/types';

export const lightColors: ColorScheme = {
  primary: '#0B6623',
  forest: '#0B6623',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceElevated: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#6B6B6B',
  textOnPrimary: '#FFFFFF',
  border: '#E0E0E0',
  error: '#B00020',
  success: '#16A34A',
  overlay: 'rgba(0,0,0,0.45)',
};

export const darkColors: ColorScheme = {
  primary: '#0B6623',
  forest: '#0B6623',
  background: '#000000',
  surface: '#0D0D0D',
  surfaceElevated: '#161616',
  text: '#FFFFFF',
  textMuted: '#9A9A9A',
  textOnPrimary: '#FFFFFF',
  border: '#242424',
  error: '#FF6B7A',
  success: '#22C55E',
  overlay: 'rgba(0,0,0,0.45)',
};

export function createMentorshipColors(colors: ColorScheme): MentorshipColorScheme {
  return colors.background === lightColors.background
    ? {
        accent: '#0B6623',
        accentMuted: '#E8F0E6',
        accentDark: '#0B6623',
        surface: '#FAFAFA',
        surfaceElevated: '#FFFFFF',
        border: '#E8E8E8',
        borderSubtle: '#F0F0F0',
        text: '#1A1A1A',
        textMuted: '#6B6B6B',
        textOnAccent: '#FFFFFF',
        bubbleMine: '#2D5A27',
        bubbleTheirs: '#F3F3F3',
        bannerBg: '#F4F7F3',
        danger: '#B00020',
        warning: '#FFF4E5',
        success: '#E8F5EE',
      }
    : {
        accent: '#0B6623',
        accentMuted: '#16211A',
        accentDark: '#0B6623',
        surface: '#0D0D0D',
        surfaceElevated: '#161616',
        border: '#242424',
        borderSubtle: '#1A1A1A',
        text: '#FFFFFF',
        textMuted: '#9A9A9A',
        textOnAccent: '#FFFFFF',
        bubbleMine: '#3D7A55',
        bubbleTheirs: '#161616',
        bannerBg: '#0D0D0D',
        danger: '#FF6B7A',
        warning: '#3D3020',
        success: '#16211A',
      };
}

export function createCvDocsTheme(colors: ColorScheme): CvDocsTheme {
  return colors.background === lightColors.background
    ? {
        pageBg: '#FFFFFF',
        barBg: '#FFFFFF',
        canvasBg: '#FFFFFF',
        searchBg: '#F5F5F5',
        searchBorder: '#DADCE0',
        divider: '#E8EAED',
        hover: '#F8F9FA',
        primaryTint: '#F0F4F8',
        textSecondary: '#5F6368',
        textOnPage: '#9AA0A6',
      }
    : {
        pageBg: colors.background,
        barBg: colors.surfaceElevated,
        canvasBg: colors.surface,
        searchBg: colors.surface,
        searchBorder: colors.border,
        divider: colors.border,
        hover: colors.surfaceElevated,
        primaryTint: '#0D1712',
        textSecondary: colors.textMuted,
        textOnPage: colors.textMuted,
      };
}

export function resolveThemeColors(resolved: ResolvedTheme): ColorScheme {
  return resolved === 'dark' ? darkColors : lightColors;
}

export function buildAppTheme(resolved: ResolvedTheme) {
  const colors = resolveThemeColors(resolved);
  return {
    colors,
    mentorshipColors: createMentorshipColors(colors),
    cvDocsTheme: createCvDocsTheme(colors),
    isDark: resolved === 'dark',
  };
}
