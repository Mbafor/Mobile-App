import type { ColorScheme } from '@/constants/theme/types';
import type { TrackerStage } from '@/types/domain/tracker';

/** Semantic accents for stages that don't map to an existing theme token. */
export const TRACKER_VIOLET = '#8b7fd6';
export const TRACKER_AMBER = '#d9a441';

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getStageAccentColor(stage: TrackerStage, colors: ColorScheme): string {
  switch (stage) {
    case 'saved':
      return colors.textMuted;
    case 'applied':
      return colors.primary;
    case 'interview':
      return TRACKER_VIOLET;
    case 'offer':
      return TRACKER_AMBER;
    case 'closed':
      return colors.textMuted;
  }
}

export function getStageChipColors(
  stage: TrackerStage,
  colors: ColorScheme,
): { background: string; text: string } {
  const accent = getStageAccentColor(stage, colors);
  if (stage === 'saved' || stage === 'closed') {
    return { background: colors.surface, text: colors.text };
  }
  return { background: hexToRgba(accent, 0.16), text: accent };
}

export type DeadlineUrgency = 'urgent' | 'soon' | 'chill';

/** daysLeft is Infinity when there's no deadline — naturally falls through to 'chill'. */
export function getDeadlineUrgency(daysLeft: number): DeadlineUrgency {
  if (daysLeft <= 7) return 'urgent';
  if (daysLeft <= 30) return 'soon';
  return 'chill';
}

export function getDeadlineBadgeColors(
  urgency: DeadlineUrgency,
  colors: ColorScheme,
): { background: string; text: string } {
  switch (urgency) {
    case 'urgent':
      return { background: hexToRgba(colors.error, 0.16), text: colors.error };
    case 'soon':
      return { background: hexToRgba(TRACKER_AMBER, 0.16), text: TRACKER_AMBER };
    case 'chill':
      return { background: hexToRgba(colors.textMuted, 0.14), text: colors.textMuted };
  }
}
