import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  appWebBase,
  emailShell,
  profileCardHtml,
  sendResendEmail,
} from '../_shared/email-templates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

type MatchNotification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  metadata: Record<string, unknown> | null;
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

    const { data: pending, error } = await supabase
      .from('notifications')
      .select('id, user_id, type, title, body, metadata')
      .in('type', ['mentor_assigned', 'mentee_assigned'])
      .is('email_sent_at', null)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!pending?.length) {
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const webBase = appWebBase();
    let sent = 0;

    for (const notification of pending as MatchNotification[]) {
      const meta = (notification.metadata ?? {}) as Record<string, unknown>;
      const counterpartId =
        notification.type === 'mentor_assigned'
          ? (meta.mentor_id as string | undefined)
          : (meta.student_id as string | undefined);

      if (!counterpartId) continue;

      const { data: recipient } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', notification.user_id)
        .maybeSingle();

      if (!recipient?.email) continue;

      const { data: counterpart } = await supabase
        .from('profiles')
        .select(
          'full_name, avatar_url, interests, career_interests, university, course_major, degree_level, country',
        )
        .eq('id', counterpartId)
        .maybeSingle();

      let mentorBio: string | null = null;
      if (notification.type === 'mentor_assigned') {
        const { data: mentorProfile } = await supabase
          .from('mentor_profiles')
          .select('bio')
          .eq('user_id', counterpartId)
          .maybeSingle();
        mentorBio = mentorProfile?.bio ?? null;
      }

      const name = counterpart?.full_name ?? 'Your match';
      const interests = [
        ...((counterpart?.interests as string[] | null) ?? []),
        ...((counterpart?.career_interests as string[] | null) ?? []),
      ];

      const firstName = recipient.full_name?.split(' ')[0] ?? 'there';
      const subject =
        notification.type === 'mentor_assigned'
          ? `🎉 Meet your new coach — ${name}`
          : `🎉 New mentee assigned — ${name}`;

      const html = emailShell({
        headline:
          notification.type === 'mentor_assigned'
            ? `You have a new coach, ${firstName}!`
            : `You have a new mentee, ${firstName}!`,
        bodyHtml: `
          <p>${notification.body}</p>
          ${profileCardHtml({
            name,
            avatarUrl: counterpart?.avatar_url ?? null,
            bio: mentorBio,
            interests,
            extraLines: [
              { label: 'University', value: counterpart?.university ?? '' },
              { label: 'Program', value: counterpart?.course_major ?? '' },
              { label: 'Degree', value: counterpart?.degree_level ?? '' },
              { label: 'Country', value: counterpart?.country ?? '' },
            ],
          })}
        `,
        ctaLabel: 'View Profile',
        ctaHref: `${webBase}/mentorship`,
        footerNote:
          'You are receiving this because you were matched on Voila mentorship.',
      });

      const result = await sendResendEmail({
        apiKey: resendApiKey,
        to: recipient.email,
        subject,
        html,
      });

      if (result.ok) {
        await supabase
          .from('notifications')
          .update({ email_sent_at: new Date().toISOString() })
          .eq('id', notification.id);
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
