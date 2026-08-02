import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { appWebBase, emailShell, sendResendEmail } from '../_shared/email-templates.ts';

// One-off nudge for every account stuck mid-onboarding (see
// docs/user-analytics-2026-08-02.md §4/§10). Not wired to the cron
// scheduler like the other reminder functions -- invoke manually with the
// CRON_SECRET header when you want to send a batch.

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

    // ?segment=finishers scopes the send to accounts that filled every
    // onboarding field but never hit "Finish" -- same completeness check as
    // hasCompletedOnboardingFields() in src/utils/profile/onboarding-status.ts.
    // Default (no param) targets every incomplete account.
    const segment = new URL(req.url).searchParams.get('segment');

    let query = supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('onboarding_complete', false)
      .is('onboarding_nudge_sent_at', null)
      .not('email', 'is', null);

    if (segment === 'finishers') {
      query = query
        .not('full_name', 'is', null)
        .not('country', 'is', null)
        .not('university', 'is', null)
        .not('course_major', 'is', null)
        .not('interests', 'eq', '{}');
    }

    const { data: stuck, error: stuckError } = await query;

    if (stuckError) {
      return new Response(JSON.stringify({ error: stuckError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!stuck || stuck.length === 0) {
      return new Response(JSON.stringify({ message: 'No stuck accounts found.', sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const webBase = appWebBase();
    let sent = 0;

    for (const profile of stuck) {
      // Atomic claim before sending -- if this batch is ever re-run, anyone
      // already claimed (or emailed by a concurrent run) is skipped.
      const { data: claimed } = await supabase
        .from('profiles')
        .update({ onboarding_nudge_sent_at: new Date().toISOString() })
        .eq('id', profile.id)
        .is('onboarding_nudge_sent_at', null)
        .select('id');

      if (!claimed || claimed.length === 0) continue;

      const firstName = profile.full_name ? profile.full_name.split(' ')[0] : 'there';

      const result = await sendResendEmail({
        apiKey: resendApiKey,
        to: profile.email,
        subject: 'Finish setting up your Voila profile',
        html: emailShell({
          headline: `You're almost set up, ${firstName}`,
          bodyHtml: `
            <p>You started creating a profile on Voila but haven't finished setting it up yet.</p>

            <p style="margin-top:16px;">Once your profile is complete, you'll be able to:</p>

            <div style="margin-top:12px;">
              <p style="margin:0 0 8px; padding-left:12px; border-left:2px solid #0B6623;">
                Browse scholarships, fellowships, and internships matched to your profile.
              </p>
              <p style="margin:8px 0; padding-left:12px; border-left:2px solid #0B6623;">
                Connect with a mentor in your field.
              </p>
              <p style="margin:8px 0; padding-left:12px; border-left:2px solid #0B6623;">
                Save opportunities and get reminders before their deadlines.
              </p>
            </div>

            <p style="margin-top:20px; font-size:13px; color:#666666;">
              It only takes a minute to finish &mdash; open the app and pick up right where you left off.
            </p>
          `,
          ctaLabel: 'Finish my profile',
          ctaHref: `${webBase}/dashboard`,
          footerNote: 'You are receiving this because you started creating an account on Voila.',
        }),
      });

      if (result.ok) sent++;
    }

    return new Response(JSON.stringify({ success: true, sent, total: stuck.length }), {
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
