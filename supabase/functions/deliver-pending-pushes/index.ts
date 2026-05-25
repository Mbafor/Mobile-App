import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const cronSecret = Deno.env.get('CRON_SECRET');
    const authHeader = req.headers.get('Authorization');
    const cronHeader = req.headers.get('x-cron-secret');
    const bearerOk = cronSecret && authHeader === `Bearer ${cronSecret}`;
    const headerOk = cronSecret && cronHeader === cronSecret;

    if (!cronSecret || (!bearerOk && !headerOk)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    await supabase.rpc('send_session_reminder_notifications');

    const { data: pending, error } = await supabase
      .from('notifications')
      .select('id, user_id, title, body, type, metadata, opportunity_id')
      .is('push_sent_at', null)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!pending?.length) {
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let sent = 0;

    for (const notification of pending) {
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('push_enabled')
        .eq('user_id', notification.user_id)
        .maybeSingle();

      if (prefs && !prefs.push_enabled) {
        await supabase
          .from('notifications')
          .update({ push_sent_at: new Date().toISOString() })
          .eq('id', notification.id);
        continue;
      }

      const { data: tokens } = await supabase
        .from('user_push_tokens')
        .select('expo_push_token')
        .eq('user_id', notification.user_id);

      if (!tokens?.length) {
        await supabase
          .from('notifications')
          .update({ push_sent_at: new Date().toISOString() })
          .eq('id', notification.id);
        continue;
      }

      const messages: ExpoPushMessage[] = tokens.map((t) => ({
        to: t.expo_push_token,
        title: notification.title,
        body: notification.body,
        sound: 'default',
        data: {
          type: notification.type,
          notificationId: notification.id,
          opportunityId: notification.opportunity_id ?? undefined,
          ...(notification.metadata as Record<string, unknown> | null),
        },
      }));

      const pushRes = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(messages),
      });

      if (pushRes.ok) {
        sent += messages.length;
        await supabase
          .from('notifications')
          .update({ push_sent_at: new Date().toISOString() })
          .eq('id', notification.id);
      }
    }

    return new Response(JSON.stringify({ success: true, sent, processed: pending.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
