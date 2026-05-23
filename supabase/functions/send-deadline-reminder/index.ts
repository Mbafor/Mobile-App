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

    // Use raw SQL to find saved opportunities with deadlines 2-4 days from now
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

    let sent = 0;

    for (const item of items) {
      if (!item.email) continue;

      const firstName = item.full_name ? item.full_name.split(' ')[0] : 'there';
      const deadline = new Date(item.deadline).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Olives Forum <onboarding@resend.dev>',
          to: [item.email],
          subject: `⏰ Deadline in 3 days: ${item.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
              <div style="margin-bottom: 24px;">
                <div style="width: 48px; height: 48px; background: #1A3D25; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                  <span style="color: white; font-size: 22px; font-weight: 600;">O</span>
                </div>
                <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">
                  Don't miss your deadline, ${firstName}!
                </h1>
                <p style="color: #555; line-height: 1.6; margin: 0;">
                  An opportunity you saved is closing in <strong>3 days</strong>.
                </p>
              </div>

              <div style="background: #F3F7F4; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Opportunity</p>
                <p style="margin: 0 0 12px; font-size: 17px; font-weight: 600; color: #1a1a1a;">
                  ${item.title}
                </p>
                <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Organisation</p>
                <p style="margin: 0 0 12px; font-size: 15px; color: #333;">
                  ${item.organization}
                </p>
                <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Deadline</p>
                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #C0392B;">
                  ${deadline}
                </p>
              </div>

              ${item.apply_url ? `
              <a href="${item.apply_url}"
                style="display: inline-block; background: #1A3D25; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
                Apply Now →
              </a>
              ` : ''}

              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

              <p style="color: #aaa; font-size: 12px; margin: 0;">
                You're receiving this because you saved this opportunity on Olives Forum.
              </p>
            </div>
          `,
        }),
      });

      if (emailRes.ok) sent++;
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