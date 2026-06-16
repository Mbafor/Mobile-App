import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { appWebBase, emailShell, sendResendEmail } from '../_shared/email-templates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-cron-secret',
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

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { data: cvs, error: cvsError } = await supabase
      .from('cvs')
      .select('id, user_id, title, content, reminder_count, last_reminder_sent_at, created_at')
      .lt('reminder_count', 3)
      .lte('created_at', twentyFourHoursAgo.toISOString())
      .or(
        `last_reminder_sent_at.is.null,last_reminder_sent_at.lte.${twentyFourHoursAgo.toISOString()}`,
      );

    if (cvsError) {
      return new Response(JSON.stringify({ error: cvsError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!cvs || cvs.length === 0) {
      return new Response(JSON.stringify({ message: 'No abandoned CVs found.', sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const webBase = appWebBase();
    let sent = 0;

    for (const cv of cvs) {
      const { data: isIncomplete } = await supabase.rpc('cv_content_is_incomplete', {
        p_content: cv.content ?? {},
      });

      if (!isIncomplete) continue;

      const { data: successPayment } = await supabase
        .from('cv_payments')
        .select('id')
        .eq('cv_id', cv.id)
        .eq('status', 'success')
        .limit(1);

      if (successPayment && successPayment.length > 0) continue;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', cv.user_id)
        .single();

      if (profileError || !profile?.email) continue;

      const firstName = profile.full_name ? profile.full_name.split(' ')[0] : 'there';
      const reminderNumber = (cv.reminder_count ?? 0) + 1;

      const messages = {
        1: {
          subject: '📄 Your CV is waiting for you — Voila',
          headline: `Your CV is ready, ${firstName}!`,
          body: "You started building your CV on Voila. It's saved and ready — come back and finish the remaining sections.",
        },
        2: {
          subject: "⏰ Don't forget your CV — Voila",
          headline: `Still interested, ${firstName}?`,
          body: 'Your CV is still saved on Voila. Continue building it today and get closer to downloading.',
        },
        3: {
          subject: '📋 Last reminder — Your CV on Voila',
          headline: `Last chance, ${firstName}`,
          body: "This is your final reminder. Your CV is waiting on Voila — we won't send any more emails about this.",
        },
      } as const;

      const message = messages[reminderNumber as keyof typeof messages];
      if (!message) continue;

      const cvUrl = `${webBase}/cv-builder/${cv.id}`;

      const result = await sendResendEmail({
        apiKey: resendApiKey,
        to: profile.email,
        subject: message.subject,
        html: emailShell({
          headline: message.headline,
          bodyHtml: `
            <p>${message.body}</p>
            <div style="background: #F3F7F4; border-radius: 12px; padding: 20px; margin-top: 16px;">
              <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Your CV</p>
              <p style="margin: 0; font-size: 17px; font-weight: 600;">${cv.title}</p>
              ${
                reminderNumber === 3
                  ? '<p style="margin: 12px 0 0; font-size: 13px; color: #C0392B;">This is your last reminder.</p>'
                  : ''
              }
            </div>
          `,
          ctaLabel: 'Continue Building CV',
          ctaHref: cvUrl,
          footerNote:
            reminderNumber === 3
              ? 'This is the last email we will send about this CV.'
              : 'You are receiving this because you started a CV on Voila.',
        }),
      });

      if (result.ok) {
        await supabase
          .from('cvs')
          .update({
            reminder_count: reminderNumber,
            last_reminder_sent_at: now.toISOString(),
          })
          .eq('id', cv.id);

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
