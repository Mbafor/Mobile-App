export type ThemeMode = 'system' | 'light' | 'dark';

export type ResolvedTheme = 'light' | 'dark';

export type ColorScheme = {
  primary: string;
  forest: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textMuted: string;
  textOnPrimary: string;
  border: string;
  error: string;
  success: string;
};

export type MentorshipColorScheme = {
  accent: string;
  accentMuted: string;
  accentDark: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  text: string;
  textMuted: string;
  textOnAccent: string;
  bubbleMine: string;
  bubbleTheirs: string;
  bannerBg: string;
  danger: string;
  warning: string;
  success: string;
};

export type CvDocsTheme = {
  pageBg: string;
  barBg: string;
  canvasBg: string;
  searchBg: string;
  searchBorder: string;
  divider: string;
  hover: string;
  primaryTint: string;
  textSecondary: string;
  textOnPage: string;
};

export type AppTheme = {
  colors: ColorScheme;
  mentorshipColors: MentorshipColorScheme;
  cvDocsTheme: CvDocsTheme;
  isDark: boolean;
};
