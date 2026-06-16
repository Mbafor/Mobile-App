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

    const { data: items, error } = await supabase.rpc('get_deadline_reminders');

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ message: 'No deadlines in range.', sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const webBase = appWebBase();
    let sent = 0;

    for (const item of items) {
      if (!item.email) continue;

      const firstName = item.full_name ? item.full_name.split(' ')[0] : 'there';
      const deadline = new Date(item.deadline).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const opportunityUrl = item.opportunity_id
        ? `${webBase}/opportunity/${item.opportunity_id}`
        : webBase;

      const result = await sendResendEmail({
        apiKey: resendApiKey,
        to: item.email,
        subject: `⏰ Deadline in 3 days: ${item.title}`,
        html: emailShell({
          headline: `Don't miss your deadline, ${firstName}!`,
          bodyHtml: `
            <p>An opportunity you saved is closing in <strong>3 days</strong>.</p>
            <div style="background: #F3F7F4; border-radius: 12px; padding: 20px; margin-top: 16px;">
              <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Opportunity</p>
              <p style="margin: 0 0 12px; font-size: 17px; font-weight: 600;">${item.title}</p>
              <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Organisation</p>
              <p style="margin: 0 0 12px;">${item.organization}</p>
              <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Deadline</p>
              <p style="margin: 0; font-weight: 600; color: #C0392B;">${deadline}</p>
            </div>
          `,
          ctaLabel: 'View Opportunity',
          ctaHref: opportunityUrl,
          footerNote: 'You are receiving this because you saved this opportunity on Voila.',
        }),
      });

      if (result.ok) sent++;
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
