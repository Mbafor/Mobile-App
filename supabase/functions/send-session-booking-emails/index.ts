import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { appWebBase, emailShell, sendResendEmail } from '../_shared/email-templates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

type SessionNotification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  metadata: Record<string, unknown> | null;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'Resend is not configured.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: pending, error } = await supabase
      .from('notifications')
      .select('id, user_id, type, title, body, metadata')
      .eq('type', 'session_booked')
      .is('email_sent_at', null)
      .order('created_at', { ascending: true })
      .limit(80);

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

    const webBase = appWebBase();
    let sent = 0;

    for (const notification of pending as SessionNotification[]) {
      const { data: recipient } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', notification.user_id)
        .maybeSingle();

      if (!recipient?.email) continue;

      const firstName = recipient.full_name?.split(' ')[0] ?? 'there';
      const meta = (notification.metadata ?? {}) as Record<string, unknown>;
      const meetingUrl =
        typeof meta.meeting_url === 'string' && meta.meeting_url ? meta.meeting_url : null;
      const sessionId = typeof meta.session_id === 'string' ? meta.session_id : null;

      const ctaHref = meetingUrl ?? `${webBase}/mentorship`;
      const ctaLabel = meetingUrl ? 'Join Meeting' : 'Open Mentorship';
      const isConfirmed = notification.title.toLowerCase().includes('confirmed');

      const result = await sendResendEmail({
        apiKey: resendApiKey,
        to: recipient.email,
        subject: isConfirmed ? '✅ Session confirmed with join link' : '📅 Session update',
        html: emailShell({
          headline: isConfirmed
            ? `Your session is confirmed, ${firstName}!`
            : `Session update for you, ${firstName}`,
          bodyHtml: `
            <p>${notification.body}</p>
            ${
              meetingUrl
                ? `<p><strong>Session link:</strong> <a href="${meetingUrl}">${meetingUrl}</a></p>`
                : ''
            }
            ${sessionId ? `<p><strong>Session ID:</strong> ${sessionId}</p>` : ''}
          `,
          ctaLabel,
          ctaHref,
          footerNote: 'You are receiving this because of a mentorship session update on Voila.',
        }),
      });

      if (result.ok) {
        await supabase
          .from('notifications')
          .update({ email_sent_at: new Date().toISOString() })
          .eq('id', notification.id);
        sent++;
      }
    }

    return new Response(JSON.stringify({ success: true, sent }), {
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
