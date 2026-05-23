import { colors } from '@/constants/theme';

/** CV builder surfaces — forest shell with white document panels. */
export const cvDocsTheme = {
  pageBg: colors.forest,
  barBg: '#FFFFFF',
  canvasBg: '#FFFFFF',
  searchBg: '#1A3D25',
  searchBorder: '#DADCE0',
  divider: '#E8EAED',
  hover: '#F8F9FA',
  primaryTint: '#E8F0EB',
  textSecondary: '#5F6368',
  /** Muted copy on the forest page background */
  textOnPage: 'rgba(255,255,255,0.65)',
} as const;
