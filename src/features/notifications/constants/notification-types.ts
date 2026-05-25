import type { NotificationType } from '@/types/domain/notification';

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  new_match: 'New match',
  deadline_reminder: 'Deadline reminder',
  saved_reminder: 'Saved reminder',
  mentor_assigned: 'Coach assigned',
  mentee_assigned: 'New mentee',
  waiting_list_update: 'Waiting list',
  session_reminder: 'Session reminder',
  mentorship_message: 'Message',
  mentor_broadcast: 'Announcement',
};

export const DEADLINE_REMINDER_DAYS = 3;
export const SAVED_REMINDER_DAYS = 1;
