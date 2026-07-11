import type { MentorshipNavItem } from '@/features/mentorship/components/shared/MentorshipDrawerNav';

/**
 * Nav section configs — id + icon only. Display labels and section titles are
 * resolved via i18n at the call site (see the dashboards), keyed by role/id
 * under `mentorship.nav.*` / `mentorship.sections.*`.
 */
export type MentorshipNavConfig = Omit<MentorshipNavItem, 'label'>;

export const STUDENT_NAV_ITEMS: MentorshipNavConfig[] = [
  { id: 'dashboard', icon: 'grid-outline' },
  { id: 'coach', icon: 'person-outline' },
  { id: 'messages', icon: 'chatbubbles-outline' },
  { id: 'book', icon: 'calendar-outline' },
  { id: 'sessions', icon: 'time-outline' },
];

export const COACH_NAV_ITEMS: MentorshipNavConfig[] = [
  { id: 'dashboard', icon: 'grid-outline' },
  { id: 'messages', icon: 'chatbubbles-outline' },
  { id: 'availability', icon: 'calendar-outline' },
  { id: 'sessions', icon: 'time-outline' },
  { id: 'notifications', icon: 'notifications-outline' },
];
