import { mapNotificationRow } from '@/services/api/mappers/notification.mapper';
import { supabase } from '@/services/supabase/client';
import type { NotificationType } from '@/types/domain/notification';

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  opportunityId?: string | null;
  dedupeKey: string;
};

export const notificationsApi = {
  list: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data: (data ?? []).map(mapNotificationRow), error };
  },

  getByDedupeKey: async (userId: string, dedupeKey: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('dedupe_key', dedupeKey)
      .maybeSingle();

    return { data: data ? mapNotificationRow(data) : null, error };
  },

  createIfMissing: async (input: CreateNotificationInput) => {
    const existing = await notificationsApi.getByDedupeKey(input.userId, input.dedupeKey);
    if (existing.error) return { data: null, error: existing.error, created: false };
    if (existing.data) return { data: existing.data, error: null, created: false };

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        opportunity_id: input.opportunityId ?? null,
        dedupe_key: input.dedupeKey,
      })
      .select('*')
      .single();

    return {
      data: data ? mapNotificationRow(data) : null,
      error,
      created: Boolean(data),
    };
  },

  markRead: async (userId: string, notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('id', notificationId)
      .is('read_at', null);

    return { error };
  },

  markAllRead: async (userId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);

    return { error };
  },

  markPushSent: async (userId: string, notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ push_sent_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('id', notificationId)
      .is('push_sent_at', null);

    return { error };
  },

  unreadCount: async (userId: string) => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null);

    return { count: count ?? 0, error };
  },

  delete: async (userId: string, notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('id', notificationId);

    return { error };
  },
};
