import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { appWebBase, emailShell, sendResendEmail } from '../_shared/email-templates.ts';

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
      return new Response(JSON.stringify({ error: 'Resend is not configured on the server.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { email, full_name, user_id } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Server-side atomic dedup: if user_id is supplied, claim the send slot in the
    // DB before sending. This prevents double emails even when the client races.
    if (user_id) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      const { data: claimed } = await supabase
        .from('profiles')
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq('id', user_id)
        .is('welcome_email_sent_at', null)
        .select('id');

      // Another caller already claimed the slot — skip silently.
      if (!claimed || claimed.length === 0) {
        return new Response(JSON.stringify({ success: true, skipped: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const firstName = full_name ? full_name.split(' ')[0] : 'there';
    const webBase = appWebBase();

    const result = await sendResendEmail({
      apiKey: resendApiKey,
      to: email,
      subject: 'Welcome to Voila',
      html: emailShell({
        headline: `Welcome, ${firstName}`,
        bodyHtml: `
          <p>You are now part of Voila &mdash; a platform built to help students and young professionals discover opportunities and connect with mentors.</p>

          <p style="margin-top:16px;">Here is what you can do on the platform:</p>

          <div style="margin-top:12px;">
            <p style="margin:0 0 8px; padding-left:12px; border-left:2px solid #0B6623;">
              Browse scholarships, fellowships, internships, and more matched to your profile.
            </p>
            <p style="margin:8px 0; padding-left:12px; border-left:2px solid #0B6623;">
              Save opportunities and get reminders before their deadlines.
            </p>
            <p style="margin:8px 0; padding-left:12px; border-left:2px solid #0B6623;">
              Connect with a mentor and book one-on-one coaching sessions.
            </p>
            <p style="margin:8px 0; padding-left:12px; border-left:2px solid #0B6623;">
              Build and download your CV directly on the platform.
            </p>
          </div>

          <p style="margin-top:20px; font-size:13px; color:#666666;">
            If you have any questions,write to
            <a href="mailto:support@voila-africa.com" style="color:#0B6623;">support@voila-africa.com</a>.
          </p>

          <p style="margin-top:24px; padding-top:20px; border-top:1px solid #e5e5e5; font-size:13px; color:#444444;">
            Stay connected and follow our latest updates on LinkedIn:
          </p>
          <p style="margin-top:8px;">
            <a href="https://www.linkedin.com/company/voila-africa/" style="display:inline-block; background-color:#0A66C2; color:#ffffff; text-decoration:none; font-size:13px; font-weight:600; padding:10px 20px; border-radius:6px;">
              Follow Voila Africa on LinkedIn
            </a>
          </p>
        `,
        ctaLabel: 'Go to Voila',
        ctaHref: `${webBase}/dashboard`,
        footerNote: 'You are receiving this because you created an account on Voila.',
      }),
    });

    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error ?? 'Failed to send email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
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
