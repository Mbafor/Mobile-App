import type { NotificationType } from '@/types/domain/notification';

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  new_match: 'New match',
  deadline_reminder: 'Deadline reminder',
  saved_reminder: 'Saved reminder',
  mentor_assigned: 'Coach assigned',
  mentee_assigned: 'New mentee',
  waiting_list_update: 'Waiting list',
  session_reminder: 'Session reminder',
  session_booked: 'Session booked',
  mentorship_message: 'Message',
  mentor_broadcast: 'Announcement',
};

export const MENTORSHIP_NOTIFICATION_TYPES: NotificationType[] = [
  'mentor_assigned',
  'mentee_assigned',
  'waiting_list_update',
  'session_reminder',
  'session_booked',
  'mentorship_message',
];

export const OPPORTUNITY_NOTIFICATION_TYPES: NotificationType[] = [
  'new_match',
  'deadline_reminder',
  'saved_reminder',
];

export const SYSTEM_NOTIFICATION_TYPES: NotificationType[] = ['mentor_broadcast'];

export const NOTIFICATION_FILTER_LABELS: Record<
  import('@/types/domain/notification').NotificationFilter,
  string
> = {
  all: 'All',
  unread: 'Unread',
  mentorship: 'Mentorship',
  opportunities: 'Opportunities',
  system: 'System',
};

export const DEADLINE_REMINDER_DAYS = 3;
export const SAVED_REMINDER_DAYS = 1;
