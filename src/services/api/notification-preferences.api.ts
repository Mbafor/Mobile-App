import { mapNotificationPreferencesRow } from '@/services/api/mappers/notification.mapper';
import { supabase } from '@/services/supabase/client';
import type { NotificationPreferences } from '@/types/domain/notification';

type PreferencePatch = Partial<
  Pick<
    NotificationPreferences,
    'pushEnabled' | 'newMatches' | 'deadlineReminders' | 'savedReminders'
  >
>;

export const notificationPreferencesApi = {
  getByUserId: async (userId: string) => {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return { data: data ? mapNotificationPreferencesRow(data) : null, error };
  },

  ensure: async (userId: string) => {
    const existing = await notificationPreferencesApi.getByUserId(userId);
    if (existing.data) return existing;

    const { data, error } = await supabase
      .from('notification_preferences')
      .insert({ user_id: userId })
      .select('*')
      .single();

    return { data: data ? mapNotificationPreferencesRow(data) : null, error };
  },

  update: async (userId: string, patch: PreferencePatch) => {
    await notificationPreferencesApi.ensure(userId);

    const row: {
      push_enabled?: boolean;
      new_matches?: boolean;
      deadline_reminders?: boolean;
      saved_reminders?: boolean;
    } = {};
    if (patch.pushEnabled !== undefined) row.push_enabled = patch.pushEnabled;
    if (patch.newMatches !== undefined) row.new_matches = patch.newMatches;
    if (patch.deadlineReminders !== undefined) row.deadline_reminders = patch.deadlineReminders;
    if (patch.savedReminders !== undefined) row.saved_reminders = patch.savedReminders;

    const { data, error } = await supabase
      .from('notification_preferences')
      .update(row)
      .eq('user_id', userId)
      .select('*')
      .single();

    return { data: data ? mapNotificationPreferencesRow(data) : null, error };
  },

  setLastMatchSyncAt: async (userId: string, iso: string) => {
    const { error } = await supabase
      .from('notification_preferences')
      .update({ last_match_sync_at: iso })
      .eq('user_id', userId);

    return { error };
  },
};
