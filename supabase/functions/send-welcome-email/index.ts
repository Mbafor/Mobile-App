import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Olives Forum <onboarding@resend.dev>',
        to: [email],
        subject: 'Welcome to Olives Forum',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
            <div style="margin-bottom: 24px;">
              <div style="width: 48px; height: 48px; background: #1A3D25; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="color: white; font-size: 22px; font-weight: 600;">O</span>
              </div>
              <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">
                Welcome, ${firstName}! 👋
              </h1>
              <p style="color: #555; line-height: 1.6; margin: 0;">
                You're now part of <strong>Olives Forum</strong> — your home for discovering global opportunities matched to your interests and ambitions.
              </p>
            </div>

            <div style="background: #F3F7F4; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 12px; font-weight: 600;">Here's what you can do:</p>
              <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 2;">
                <li>Browse opportunities matched to your profile</li>
                <li>Save listings and never miss a deadline</li>
                <li>Get notified when new matches appear</li>
              </ul>
            </div>

            <p style="color: #888; font-size: 13px; line-height: 1.6;">
              If you have any questions, reply to this email or contact us at support@olivesforum.com.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

            <p style="color: #aaa; font-size: 12px; margin: 0;">
              Olives Forum · Helping students find global opportunities
            </p>
          </div>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.message ?? 'Failed to send email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
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