import type { MentorshipNavItem } from '@/features/mentorship/components/shared/MentorshipDrawerNav';

export const STUDENT_NAV_ITEMS: MentorshipNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
  { id: 'coach', label: 'My Coach', icon: 'person-outline' },
  { id: 'messages', label: 'Messages', icon: 'chatbubbles-outline' },
  { id: 'book', label: 'Book session', icon: 'calendar-outline' },
  { id: 'sessions', label: 'Upcoming sessions', icon: 'time-outline' },
];

export const COACH_NAV_ITEMS: MentorshipNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
  { id: 'messages', label: 'Messages', icon: 'chatbubbles-outline' },
  { id: 'availability', label: 'Availability', icon: 'calendar-outline' },
  { id: 'sessions', label: 'Sessions', icon: 'time-outline' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
];

export const STUDENT_SECTION_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  coach: 'My Coach',
  messages: 'Messages',
  book: 'Book a Session',
  sessions: 'Upcoming Sessions',
};

export const COACH_SECTION_TITLES: Record<string, string> = {
  dashboard: 'Mentees',
  messages: 'Messages',
  availability: 'Calendar & Availability',
  sessions: 'Session Management',
  notifications: 'Notifications',
};
