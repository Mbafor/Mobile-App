// @ts-nocheck — Deno runtime file; type-checked by Deno, not the Node.js TS compiler.
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

/**
 * Build a signed JWT assertion for a Google Service Account and exchange it for
 * a short-lived Google access token.
 *
 * The `sub` claim performs Domain-Wide Delegation (DWD): the access token will
 * act on behalf of the Google Workspace user named in
 * GOOGLE_SERVICE_ACCOUNT_IMPERSONATE_EMAIL, not the service account itself.
 * This is required to create Calendar events with Meet links under your domain.
 */
async function getServiceAccountAccessToken(): Promise<string> {
  const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const rawPrivateKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
  const impersonateEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_IMPERSONATE_EMAIL');

  if (!serviceAccountEmail || !rawPrivateKey || !impersonateEmail) {
    throw new Error(
      'Missing Service Account credentials. ' +
        'Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, ' +
        'and GOOGLE_SERVICE_ACCOUNT_IMPERSONATE_EMAIL as Supabase Edge Function secrets.',
    );
  }

  // Supabase secrets store newlines as literal \n — normalise before parsing.
  const pem = rawPrivateKey.replace(/\\n/g, '\n');

  // Strip the PEM armour and decode the base64 DER bytes.
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');

  const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    der.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  // Base64url-encode a plain string (no padding, URL-safe chars).
  const toB64Url = (s: string): string =>
    btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const now = Math.floor(Date.now() / 1000);

  const header = toB64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = toB64Url(
    JSON.stringify({
      iss: serviceAccountEmail,
      // DWD: impersonate the designated Workspace user so we can write to their calendar.
      sub: impersonateEmail,
      scope: 'https://www.googleapis.com/auth/calendar',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  );

  const signingInput = `${header}.${payload}`;

  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput),
  );

  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const jwt = `${signingInput}.${signature}`;

  // Exchange the signed JWT assertion for a short-lived OAuth 2.0 access token.
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    throw new Error(
      `Service Account token exchange failed: ${tokenData.error_description ?? tokenData.error ?? 'Unknown error'}`,
    );
  }

  return tokenData.access_token as string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify the caller is an authenticated Supabase user.
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

    // Obtain a Google access token via Service Account + Domain-Wide Delegation.
    // No user OAuth token is needed — the service account handles everything.
    const accessToken = await getServiceAccountAccessToken();

    // The calendar to host the event. When using DWD this is relative to the
    // impersonated user — 'primary' means their primary calendar.
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
          attendees: [{ email: body.coachEmail }, { email: body.studentEmail }],
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

    // Google returns the Meet link in one of two places depending on the account type.
    const meetingUrl: string | null =
      eventJson.hangoutLink ??
      eventJson.conferenceData?.entryPoints?.find(
        (e: { entryPointType: string; uri?: string }) => e.entryPointType === 'video',
      )?.uri ??
      null;

    if (!meetingUrl) {
      console.error('No Meet link in response:', JSON.stringify(eventJson?.conferenceData));
      return new Response(
        JSON.stringify({
          error:
            'Google returned no Meet link. ' +
            'Ensure the impersonated Workspace account has Google Meet enabled ' +
            'and that the service account has DWD granted for the calendar scope.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Write the Meet URL to the session row using the service role key.
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { error: updateError } = await serviceClient
      .from('mentorship_sessions')
      .update({ meeting_url: meetingUrl, status: 'confirmed' })
      .eq('id', body.sessionId);

    if (updateError) {
      console.error('Failed to persist meeting URL:', updateError.message);
    }

    return new Response(JSON.stringify({ meetingUrl, eventId: eventJson.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('google-calendar-create-event error:', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
