import { createMentorshipColors } from '@/constants/theme/palettes';
import { lightColors } from '@/constants/theme/palettes';

/** @deprecated Use `useTheme().mentorshipColors` for theme-aware styling */
export const mentorshipColors = createMentorshipColors(lightColors);
