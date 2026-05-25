import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
    const { email, full_name } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const firstName = full_name ? full_name.split(' ')[0] : 'there';
    const webBase = appWebBase();

    const result = await sendResendEmail({
      apiKey: resendApiKey,
      to: email,
      subject: 'Welcome to Olives Forum',
      html: emailShell({
        headline: `Welcome, ${firstName}! 👋`,
        bodyHtml: `
          <p>
            You're now part of <strong>Olives Forum</strong> — your home for discovering global
            opportunities matched to your interests and ambitions.
          </p>
          <div style="background: #F3F7F4; border-radius: 12px; padding: 20px; margin-top: 16px;">
            <p style="margin: 0 0 12px; font-weight: 600; color: #1a1a1a;">Here's what you can do:</p>
            <ul style="margin: 0; padding-left: 20px; line-height: 2;">
              <li>Browse opportunities matched to your profile</li>
              <li>Save listings and never miss a deadline</li>
              <li>Connect with mentors and book sessions</li>
            </ul>
          </div>
          <p style="margin-top: 16px; font-size: 14px;">
            Questions? Reply to this email or contact support@olivesforum.com.
          </p>
        `,
        ctaLabel: 'Open Platform',
        ctaHref: webBase,
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
