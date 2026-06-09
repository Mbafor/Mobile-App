import type { DeepPartial, ThemeConfigs } from '@howljs/calendar-kit';

import { calendarColors } from '@/features/mentorship/constants/calendar-colors';
import type { MentorshipColorScheme } from '@/constants/theme/types';

export function createMentorshipCalendarTheme(
  mentorshipColors: MentorshipColorScheme,
): DeepPartial<ThemeConfigs> {
  return {
    colors: {
      primary: mentorshipColors.accent,
      onPrimary: mentorshipColors.textOnAccent,
      background: mentorshipColors.surfaceElevated,
      onBackground: mentorshipColors.text,
      border: calendarColors.border,
      text: mentorshipColors.text,
      surface: calendarColors.empty,
      onSurface: mentorshipColors.textMuted,
    },
    hourTextStyle: { color: mentorshipColors.textMuted, fontSize: 11 },
    unavailableHourBackgroundColor: calendarColors.empty,
    nowIndicatorColor: mentorshipColors.accent,
  };
}
