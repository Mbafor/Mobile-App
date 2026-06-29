import { supabase } from '@/services/supabase/client';

export const notificationsEmailApi = {
  sendWelcome: async (userId: string, email: string, fullName: string | null) => {
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: { user_id: userId, email, full_name: fullName },
    });
    return { data, error };
  },

  sendNewOpportunityEmails: async (opportunityId: string) => {
    const { data, error } = await supabase.functions.invoke('send-new-opportunity-emails', {
      body: { opportunity_id: opportunityId },
    });
    return { data, error };
  },
};
