import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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

    // Step 1: Find CVs created 24+ hours ago with less than 3 reminders
    const { data: cvs, error: cvsError } = await supabase
      .from('cvs')
      .select('id, user_id, title, reminder_count, last_reminder_sent_at, created_at')
      .lt('reminder_count', 3)
      .lte('created_at', twentyFourHoursAgo.toISOString())
      .or(`last_reminder_sent_at.is.null,last_reminder_sent_at.lte.${twentyFourHoursAgo.toISOString()}`);

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

    let sent = 0;

    for (const cv of cvs) {
      // Step 2: Check if user has a successful payment for this CV
      const { data: successPayment } = await supabase
        .from('cv_payments')
        .select('id')
        .eq('cv_id', cv.id)
        .eq('status', 'success')
        .limit(1);

      if (successPayment && successPayment.length > 0) continue;

      // Step 3: Get user profile separately
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', cv.user_id)
        .single();

      if (profileError || !profile?.email) continue;

      const firstName = profile.full_name ? profile.full_name.split(' ')[0] : 'there';
      const reminderNumber = cv.reminder_count + 1;

      const messages = {
        1: {
          subject: '📄 Your CV is waiting for you — Olives Forum',
          headline: `Your CV is ready, ${firstName}!`,
          body: "You started building your CV on Olives Forum. It's saved and ready — come back and download it.",
        },
        2: {
          subject: "⏰ Don't forget your CV — Olives Forum",
          headline: `Still interested, ${firstName}?`,
          body: 'Your CV is still saved on Olives Forum. Download it today and start applying to opportunities.',
        },
        3: {
          subject: '📋 Last reminder — Your CV on Olives Forum',
          headline: `Last chance, ${firstName}`,
          body: "This is your final reminder. Your CV is ready to download on Olives Forum. We won't send any more emails about this.",
        },
      };

      const message = messages[reminderNumber as keyof typeof messages];

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Olives Forum <onboarding@resend.dev>',
          to: [profile.email],
          subject: message.subject,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
              <div style="margin-bottom: 24px;">
                <div style="width: 48px; height: 48px; background: #1A3D25; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                  <span style="color: white; font-size: 22px; font-weight: 600;">O</span>
                </div>
                <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">
                  ${message.headline}
                </h1>
                <p style="color: #555; line-height: 1.6; margin: 0;">
                  ${message.body}
                </p>
              </div>

              <div style="background: #F3F7F4; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Your CV</p>
                <p style="margin: 0; font-size: 17px; font-weight: 600; color: #1a1a1a;">
                  ${cv.title}
                </p>
                ${reminderNumber === 3 ? `
                <p style="margin: 12px 0 0; font-size: 13px; color: #C0392B;">
                  This is your last reminder.
                </p>
                ` : ''}
              </div>

              <a href="https://olivesforum.com/cv"
                style="display: inline-block; background: #1A3D25; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
                Download My CV →
              </a>

              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

              <p style="color: #aaa; font-size: 12px; margin: 0;">
                You're receiving this because you created a CV on Olives Forum.
                ${reminderNumber === 3 ? 'This is the last email we will send about your CV.' : ''}
              </p>
            </div>
          `,
        }),
      });

      if (emailRes.ok) {
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