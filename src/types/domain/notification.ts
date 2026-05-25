export type NotificationType =
  | 'new_match'
  | 'deadline_reminder'
  | 'saved_reminder'
  | 'mentor_assigned'
  | 'mentee_assigned'
  | 'waiting_list_update'
  | 'session_reminder'
  | 'mentorship_message'
  | 'mentor_broadcast';

export type NotificationPreferences = {
  userId: string;
  pushEnabled: boolean;
  newMatches: boolean;
  deadlineReminders: boolean;
  savedReminders: boolean;
  mentorshipAssignments: boolean;
  waitingListUpdates: boolean;
  sessionReminders: boolean;
  mentorshipMessages: boolean;
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
  metadata: Record<string, unknown>;
  dedupeKey: string;
  readAt: string | null;
  pushSentAt: string | null;
  createdAt: string;
};

export type PushPermissionStatus = 'granted' | 'denied' | 'undetermined' | 'unavailable';
