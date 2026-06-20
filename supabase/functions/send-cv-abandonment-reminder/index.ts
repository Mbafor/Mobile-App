import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { appWebBase, emailShell, infoBox, sendResendEmail } from '../_shared/email-templates.ts';

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

      // One email per day over 3 days
      const messages = {
        1: {
          subject: 'Your CV is waiting — Voila',
          headline: `Your CV is ready to finish, ${firstName}`,
          body: 'You started building your CV on Voila. It is saved and ready for you to continue. Complete the remaining sections to unlock your download.',
        },
        2: {
          subject: 'Continue your CV — Voila',
          headline: `Still building your CV, ${firstName}?`,
          body: 'Your CV is still saved on Voila. Come back today, finish the remaining sections, and get one step closer to downloading it.',
        },
        3: {
          subject: 'Final reminder — Your CV on Voila',
          headline: `Last reminder, ${firstName}`,
          body: 'This is the last email we will send about your CV. It is still saved on Voila and ready for you to complete. After this, we will not send any more reminders.',
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
            ${infoBox([
              { label: 'Your CV', value: cv.title },
              { label: 'Reminder', value: `${reminderNumber} of 3` },
            ])}
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
