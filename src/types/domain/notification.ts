export type NotificationType = 'new_match' | 'deadline_reminder' | 'saved_reminder';

export type NotificationPreferences = {
  userId: string;
  pushEnabled: boolean;
  newMatches: boolean;
  deadlineReminders: boolean;
  savedReminders: boolean;
  lastMatchSyncAt: string | null;
  updatedAt: string;
};

export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  opportunityId: string | null;
  dedupeKey: string;
  readAt: string | null;
  pushSentAt: string | null;
  createdAt: string;
};

export type PushPermissionStatus = 'granted' | 'denied' | 'undetermined' | 'unavailable';
