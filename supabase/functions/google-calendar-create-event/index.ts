import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { JWT } from 'https://esm.sh/google-auth-library@9.14.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type RequestBody = {
  sessionId: string;
  coachEmail: string;
  studentEmail: string;
  scheduledStart: string;
  scheduledEnd: string;
  timezone: string;
  title: string;
};

async function getCalendarClient() {
  const clientEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')?.replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) {
    throw new Error(
      'Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY for Calendar + Meet.',
    );
  }

  const auth = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  return auth;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as RequestBody;
    const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID') ?? 'primary';
    const auth = await getCalendarClient();
    const accessToken = await auth.getAccessToken();

    const eventRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: body.title,
          description: 'OLF Mentorship session',
          start: { dateTime: body.scheduledStart, timeZone: body.timezone },
          end: { dateTime: body.scheduledEnd, timeZone: body.timezone },
          attendees: [{ email: body.coachEmail }, { email: body.studentEmail }],
          conferenceData: {
            createRequest: {
              requestId: `olf-${body.sessionId}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        }),
      },
    );

    const eventJson = await eventRes.json();
    if (!eventRes.ok) {
      return new Response(
        JSON.stringify({ error: eventJson.error?.message ?? 'Google Calendar API error' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const meetingUrl =
      eventJson.hangoutLink ??
      eventJson.conferenceData?.entryPoints?.find(
        (e: { entryPointType: string; uri?: string }) => e.entryPointType === 'video',
      )?.uri ??
      null;

    if (!meetingUrl) {
      return new Response(JSON.stringify({ error: 'Meet link was not returned by Google.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const service = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    await service
      .from('mentorship_sessions')
      .update({ meeting_url: meetingUrl, status: 'confirmed' })
      .eq('id', body.sessionId);

    return new Response(JSON.stringify({ meetingUrl, eventId: eventJson.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
