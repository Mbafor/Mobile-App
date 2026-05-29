import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

/** Exchange the stored refresh token for a short-lived access token. */
async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing Google credentials. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN as Supabase Edge Function secrets.',
    );
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Google token refresh failed: ${data.error_description ?? data.error ?? 'Unknown error'}`,
    );
  }

  return data.access_token as string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify the caller is a signed-in Supabase user.
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

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as RequestBody;

    // Get a fresh Google access token using the stored refresh token.
    const accessToken = await getAccessToken();

    // The calendar to create the event on — 'primary' means the account that owns the refresh token.
    const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID') ?? 'primary';

    const eventRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: body.title,
          description: 'Olives Forum mentorship session',
          start: { dateTime: body.scheduledStart, timeZone: body.timezone },
          end: { dateTime: body.scheduledEnd, timeZone: body.timezone },
          attendees: [
            { email: body.coachEmail },
            { email: body.studentEmail },
          ],
          conferenceData: {
            createRequest: {
              requestId: `olf-${body.sessionId}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
          guestsCanModify: false,
          guestsCanInviteOthers: false,
        }),
      },
    );

    const eventJson = await eventRes.json();

    if (!eventRes.ok) {
      console.error('Google Calendar API error:', JSON.stringify(eventJson));
      return new Response(
        JSON.stringify({ error: eventJson.error?.message ?? 'Google Calendar API error' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Extract the Meet link from either location Google returns it.
    const meetingUrl: string | null =
      eventJson.hangoutLink ??
      eventJson.conferenceData?.entryPoints?.find(
        (e: { entryPointType: string; uri?: string }) => e.entryPointType === 'video',
      )?.uri ??
      null;

    if (!meetingUrl) {
      console.error('No Meet link in response:', JSON.stringify(eventJson?.conferenceData));
      return new Response(
        JSON.stringify({ error: 'Google returned no Meet link. Ensure the Google account has Google Meet enabled.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Persist the Meet URL directly on the session row using the service role.
    const service = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { error: updateError } = await service
      .from('mentorship_sessions')
      .update({ meeting_url: meetingUrl, status: 'confirmed' })
      .eq('id', body.sessionId);

    if (updateError) {
      console.error('Failed to persist meeting URL:', updateError.message);
    }

    return new Response(
      JSON.stringify({ meetingUrl, eventId: eventJson.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('google-calendar-create-event error:', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
