import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { appWebBase, emailShell, infoBox, sendResendEmail } from '../_shared/email-templates.ts';

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

function formatSessionTime(isoString: string | undefined): string {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short',
    });
  } catch {
    return isoString;
  }
}

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

    // Handle both booking confirmations and 15-minute reminders
    const { data: pending, error } = await supabase
      .from('notifications')
      .select('id, user_id, type, title, body, metadata')
      .in('type', ['session_booked', 'session_reminder'])
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
      const sessionTime =
        typeof meta.session_time === 'string' ? meta.session_time : undefined;
      const otherPartyName =
        typeof meta.other_party_name === 'string' ? meta.other_party_name : '';

      let emailHtml: string;
      let subject: string;

      if (notification.type === 'session_reminder') {
        // 15-minute reminder
        subject = 'Your session starts in 15 minutes';
        emailHtml = emailShell({
          headline: `Your session starts in 15 minutes, ${firstName}`,
          bodyHtml: `
            <p>
              Your mentorship session is about to begin. Make sure you are ready and have a
              stable internet connection before joining.
            </p>
            ${infoBox([
              ...(otherPartyName ? [{ label: 'Session with', value: otherPartyName }] : []),
              ...(sessionTime ? [{ label: 'Scheduled time', value: formatSessionTime(sessionTime) }] : []),
              ...(meetingUrl ? [{ label: 'Meeting link', value: `<a href="${meetingUrl}" style="color:#0B6623;">${meetingUrl}</a>` }] : []),
            ])}
            ${
              !meetingUrl
                ? `<p style="margin-top:16px; font-size:13px; color:#666666;">
                     Open the Voila app to find your session link.
                   </p>`
                : ''
            }
          `,
          ctaLabel: meetingUrl ? 'Join Session Now' : 'Open Voila',
          ctaHref: meetingUrl ?? `${webBase}/mentorship`,
          footerNote: 'You are receiving this because you have a mentorship session scheduled on Voila.',
        });
      } else {
        // session_booked — booking confirmation
        const isConfirmed = notification.title.toLowerCase().includes('confirmed');
        subject = isConfirmed ? 'Session confirmed — Voila' : 'Session update — Voila';

        emailHtml = emailShell({
          headline: isConfirmed
            ? `Session confirmed, ${firstName}`
            : `Session update, ${firstName}`,
          bodyHtml: `
            <p>${notification.body}</p>
            ${infoBox([
              ...(otherPartyName ? [{ label: 'Session with', value: otherPartyName }] : []),
              ...(sessionTime ? [{ label: 'Scheduled time', value: formatSessionTime(sessionTime) }] : []),
              ...(meetingUrl
                ? [{ label: 'Meeting link', value: `<a href="${meetingUrl}" style="color:#0B6623;">${meetingUrl}</a>` }]
                : []),
            ])}
            <p style="margin-top:16px; font-size:13px; color:#666666;">
              You will receive another reminder 15 minutes before your session starts.
            </p>
          `,
          ctaLabel: meetingUrl ? 'Join Meeting' : 'Open Mentorship',
          ctaHref: meetingUrl ?? `${webBase}/mentorship`,
          footerNote: 'You are receiving this because of a mentorship session on Voila.',
        });
      }

      const result = await sendResendEmail({
        apiKey: resendApiKey,
        to: recipient.email,
        subject,
        html: emailHtml,
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
