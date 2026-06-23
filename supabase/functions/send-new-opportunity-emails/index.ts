import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { appWebBase, emailShell, infoBox, sendResendEmail } from '../_shared/email-templates.ts';

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

    // Verify the caller is an authenticated admin user.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: canManage, error: permError } = await supabaseUser.rpc(
      'current_user_can_manage_opportunities',
    );
    if (permError || !canManage) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { opportunity_id } = body as { opportunity_id?: string };
    if (!opportunity_id) {
      return new Response(JSON.stringify({ error: 'Missing opportunity_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role to bypass RLS for cross-user queries.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Fetch opportunity details.
    const { data: opp, error: oppError } = await supabase
      .from('opportunities')
      .select('id, title, organization, category, country, deadline, degree_levels, location_type')
      .eq('id', opportunity_id)
      .eq('status', 'approved')
      .eq('is_active', true)
      .maybeSingle();

    if (oppError || !opp) {
      return new Response(JSON.stringify({ error: 'Opportunity not found or not active' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find users whose profiles match this opportunity.
    const { data: users, error: usersError } = await supabase.rpc(
      'get_opportunity_matched_users',
      { p_opportunity_id: opportunity_id },
    );

    if (usersError) {
      return new Response(JSON.stringify({ error: usersError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const webBase = appWebBase();
    const opportunityUrl = `${webBase}/opportunity/${opp.id}`;

    const deadline = opp.deadline
      ? new Date(opp.deadline).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '';

    const degreeLevels =
      Array.isArray(opp.degree_levels) && opp.degree_levels.length > 0
        ? (opp.degree_levels as string[]).join(', ')
        : '';

    let sent = 0;

    for (const user of users as { user_id: string; email: string; full_name: string | null }[]) {
      if (!user.email) continue;

      const firstName = user.full_name ? user.full_name.split(' ')[0] : 'there';

      const result = await sendResendEmail({
        apiKey: resendApiKey,
        to: user.email,
        subject: `New Opportunity Available: ${opp.title}`,
        html: emailShell({
          headline: `Hello, ${firstName}`,
          bodyHtml: `
            <p>A new opportunity is available on Voila that matches your profile:</p>
            ${infoBox([
              { label: 'Title', value: opp.title ?? '' },
              { label: 'Organisation', value: opp.organization ?? '' },
              { label: 'Category', value: opp.category ?? '' },
              { label: 'Country', value: opp.country ?? '' },
              { label: 'Deadline', value: deadline },
              { label: 'Degree levels', value: degreeLevels },
              { label: 'Location', value: opp.location_type ?? '' },
            ])}
          `,
          ctaLabel: 'View Opportunity',
          ctaHref: opportunityUrl,
          footerNote:
            'You are receiving this because your profile matches this opportunity on Voila. Update your notification preferences in settings to stop receiving these emails.',
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
