import { supabase } from '@/services/supabase/client';

export const pushTokensApi = {
  upsert: async (params: {
    userId: string;
    expoPushToken: string;
    platform?: string;
    deviceId?: string;
  }) => {
    const { error } = await supabase.from('user_push_tokens').upsert(
      {
        user_id: params.userId,
        expo_push_token: params.expoPushToken,
        platform: params.platform ?? null,
        device_id: params.deviceId ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,expo_push_token' },
    );

    return { error };
  },

  remove: async (userId: string, expoPushToken: string) => {
    const { error } = await supabase
      .from('user_push_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('expo_push_token', expoPushToken);

    return { error };
  },

  removeAllForUser: async (userId: string) => {
    const { error } = await supabase.from('user_push_tokens').delete().eq('user_id', userId);

    return { error };
  },
};
