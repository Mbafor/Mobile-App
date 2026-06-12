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
  success: '#1B7F4E',
};

export const darkColors: ColorScheme = {
  primary: '#5BA876',
  forest: '#0A1510',
  background: '#0F1412',
  surface: '#1A211E',
  surfaceElevated: '#232A27',
  text: '#F0F2F1',
  textMuted: '#9CA39E',
  textOnPrimary: '#0F1412',
  border: '#2E3530',
  error: '#FF6B7A',
  success: '#5BC48A',
};

export function createMentorshipColors(colors: ColorScheme): MentorshipColorScheme {
  return colors.background === lightColors.background
    ? {
        accent: '#2D5A27',
        accentMuted: '#E8F0E6',
        accentDark: '#1E3D1A',
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
        accent: '#5BA876',
        accentMuted: '#1E2E24',
        accentDark: '#3D7A55',
        surface: '#141914',
        surfaceElevated: '#1C211D',
        border: '#2E3530',
        borderSubtle: '#252B27',
        text: '#F0F2F1',
        textMuted: '#9CA39E',
        textOnAccent: '#0F1412',
        bubbleMine: '#3D7A55',
        bubbleTheirs: '#2A302C',
        bannerBg: '#1A221C',
        danger: '#FF6B7A',
        warning: '#3D3020',
        success: '#1E2E24',
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
        primaryTint: '#1A2A22',
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
