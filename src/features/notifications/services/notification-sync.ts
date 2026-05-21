import { presentLocalPush, setAppBadgeCount } from '@/features/notifications/services/local-push';
import { buildSyncCandidates } from '@/features/notifications/utils/notification-rules';
import {
  notificationPreferencesApi,
  notificationsApi,
  savedOpportunitiesApi,
} from '@/services/api';
import { opportunitiesApi } from '@/services/api/opportunities.api';
import { profilesApi, userPreferencesApi } from '@/services/api';
import type { NotificationPreferences } from '@/types/domain/notification';

export type NotificationSyncResult = {
  created: number;
  pushed: number;
};

export async function runNotificationSync(userId: string): Promise<NotificationSyncResult> {
  const { data: prefs, error: prefsError } = await notificationPreferencesApi.ensure(userId);
  if (prefsError || !prefs) return { created: 0, pushed: 0 };

  const [opportunitiesRes, savedRes, profileRes, userPrefsRes] = await Promise.all([
    opportunitiesApi.listActive(),
    savedOpportunitiesApi.listOpportunityIds(userId),
    profilesApi.getByUserId(userId),
    userPreferencesApi.getByUserId(userId),
  ]);

  if (opportunitiesRes.error || !opportunitiesRes.data) {
    return { created: 0, pushed: 0 };
  }

  const savedIds = savedRes.data ?? [];
  const interests = profileRes.data?.interests ?? [];
  const opportunityTypes = userPrefsRes.data?.opportunityTypes ?? [];

  const candidates = buildSyncCandidates({
    userId,
    opportunities: opportunitiesRes.data,
    savedIds,
    interests,
    opportunityTypes,
    lastMatchSyncAt: prefs.lastMatchSyncAt,
    prefs: {
      newMatches: prefs.newMatches,
      deadlineReminders: prefs.deadlineReminders,
      savedReminders: prefs.savedReminders,
    },
  });

  let created = 0;
  let pushed = 0;

  for (const candidate of candidates) {
    const { data, created: wasCreated, error } = await notificationsApi.createIfMissing(candidate);
    if (error || !data) continue;
    if (wasCreated) created += 1;

    const shouldPush = prefs.pushEnabled && !data.pushSentAt;
    if (shouldPush) {
      const sent = await presentLocalPush(data);
      if (sent) {
        pushed += 1;
        await notificationsApi.markPushSent(userId, data.id);
      }
    }
  }

  if (prefs.newMatches) {
    await notificationPreferencesApi.setLastMatchSyncAt(userId, new Date().toISOString());
  }

  const { count } = await notificationsApi.unreadCount(userId);
  await setAppBadgeCount(count);

  return { created, pushed };
}

export function shouldRunPushRegistration(prefs: NotificationPreferences | null): boolean {
  return Boolean(prefs?.pushEnabled);
}
