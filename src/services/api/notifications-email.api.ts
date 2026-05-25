import { supabase } from '@/services/supabase/client';

export const notificationsEmailApi = {
  sendWelcome: async (email: string, fullName: string | null) => {
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: { email, full_name: fullName },
    });
    return { data, error };
  },
};
