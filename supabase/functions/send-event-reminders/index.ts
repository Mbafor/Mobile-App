import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { appWebBase, emailShell, sendResendEmail, whatsappEventsUrl } from '../_shared/email-templates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

// Each tier's RPC call + subject line. Day-based tiers (3day/1day/dayof)
// match by calendar date and are safe to re-check on every run since
// they're idempotent via their own *_sent flag -- there's no need for a
// separate daily-only schedule. Minute-based tiers (1hr/30min) need the
// cron to actually run frequently (every 5-15 min) or they'll be missed or
// fire late; see get_event_reminder_batch_minutes in 056_event_reminder_tiers.sql.
const REMINDER_TIERS = [
  { rpc: 'get_event_reminder_batch', arg: 'p_days_ahead', value: 3, kind: '3day', subject: 'is in 3 days' },
  { rpc: 'get_event_reminder_batch', arg: 'p_days_ahead', value: 1, kind: '1day', subject: 'is tomorrow' },
  { rpc: 'get_event_reminder_batch', arg: 'p_days_ahead', value: 0, kind: 'dayof', subject: 'is today' },
  { rpc: 'get_event_reminder_batch_minutes', arg: 'p_minutes_ahead', value: 60, kind: '1hr', subject: 'starts in 1 hour' },
  { rpc: 'get_event_reminder_batch_minutes', arg: 'p_minutes_ahead', value: 30, kind: '30min', subject: 'starts in 30 minutes' },
] as const;

type Tier = (typeof REMINDER_TIERS)[number];

interface ReminderItem {
  registration_id: string;
  event_id: string;
  full_name: string;
  email: string;
  event_title: string;
  event_slug: string;
  start_time: string;
  end_time: string | null;
  timezone: string;
  location_type: string;
  location_platform: string | null;
  meeting_link: string | null;
  image_url: string | null;
}

function formatDate(iso: string, timezone: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: timezone,
    });
  } catch {
    return new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  }
}

function formatTime(iso: string, timezone: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', timeZone: timezone });
  } catch {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
  }
}

function eventImageHtml(imageUrl: string | null, title: string): string {
  if (!imageUrl) return '';
  return `<img src="${imageUrl}" alt="${title}" style="width:100%; height:auto; border-radius:4px; margin-top:24px; display:block;" />`;
}

function ctaButtonHtml(href: string, label: string): string {
  return `
    <div style="margin-top:28px;">
      <a href="${href}"
         style="display:inline-block; background:#0B6623; color:#ffffff;
                padding:13px 28px; text-decoration:none; font-size:14px;
                font-weight:600; letter-spacing:0.2px;">
        ${label}
      </a>
    </div>`;
}

function whatsappJoinLine(url: string): string {
  return `
    <p style="margin:16px 0 0;">
      Join our WhatsApp group to get timely updates about this event:
      <br />
      <a href="${url}" style="color:#0B6623; font-weight:600;">${url}</a>
    </p>`;
}

/** In-person venue line every tier from "1 day before" onward includes.
 * Virtual events don't need this -- their join link is the CTA button
 * itself (see ctaForItem) rather than a separate line. */
function locationLine(item: ReminderItem): string {
  if (item.location_type !== 'virtual' && item.location_platform) {
    return `<p style="margin:16px 0;">&#128205; Location: ${item.location_platform}</p>`;
  }
  return '';
}

/** From "1 day before" onward, a virtual event's CTA becomes the meeting
 * link itself ("Join Here") instead of the event page ("View event
 * details") -- the registrant already has the details, so the button
 * should take them straight into the session. */
function ctaForItem(item: ReminderItem, eventUrl: string): string {
  if (item.location_type === 'virtual' && item.meeting_link) {
    return ctaButtonHtml(item.meeting_link, 'Join Here');
  }
  return ctaButtonHtml(eventUrl, 'View event details');
}

function dateTimeLines(item: ReminderItem): string {
  return `
    <p style="margin:16px 0 0;">&#128197; Date: ${formatDate(item.start_time, item.timezone)}</p>
    <p style="margin:4px 0 16px;">&#128340; Time: ${formatTime(item.start_time, item.timezone)} ${item.timezone}</p>
  `;
}

function buildBodyHtml(tier: Tier, item: ReminderItem, firstName: string, eventUrl: string, whatsappUrl: string): string {
  const image = eventImageHtml(item.image_url, item.event_title);
  const whatsapp = whatsappJoinLine(whatsappUrl);
  // 3-day still points at the event page -- the "Join Here" meeting-link
  // button only starts from the 1-day tier onward.
  const viewEventCta = ctaButtonHtml(eventUrl, 'View event details');
  const cta = tier.kind === '3day' ? viewEventCta : ctaForItem(item, eventUrl);

  switch (tier.kind) {
    case '3day':
      return `
        <p>Hi ${firstName},</p>
        <p>Just a reminder that <strong>${item.event_title}</strong> is happening in 3 days.</p>
        ${dateTimeLines(item)}
        <p>We're looking forward to an insightful session with our speaker, and we can't wait to see you there.</p>
        ${whatsapp}
        <p>Keep an eye on your inbox for further reminders and joining details.</p>
        ${cta}
        <p style="margin-top:20px;">The Voila Africa Team</p>
        ${image}
      `;
    case '1day':
      return `
        <p>Hi ${firstName},</p>
        <p>Your webinar, <strong>${item.event_title}</strong>, is happening tomorrow.</p>
        ${dateTimeLines(item)}
        ${locationLine(item)}
        ${whatsapp}
        <p>We recommend adding the event to your calendar so you don't miss it.</p>
        ${cta}
        <p style="margin-top:20px;">See you tomorrow!</p>
        <p style="margin:20px 0 0;">The Voila Africa Team</p>
        ${image}
      `;
    case 'dayof':
      return `
        <p>Hi ${firstName},</p>
        <p>Today's the day!</p>
        <p><strong>${item.event_title}</strong> takes place today.</p>
        ${dateTimeLines(item)}
        ${locationLine(item)}
        ${whatsapp}
        <p>We're excited to have you with us. Make sure your device and internet connection are ready before the session begins.</p>
        ${cta}
        <p style="margin-top:20px;">See you soon!</p>
        <p style="margin:20px 0 0;">The Voila Africa Team</p>
        ${image}
      `;
    case '1hr':
      return `
        <p>Hi ${firstName},</p>
        <p>This is a reminder that <strong>${item.event_title}</strong> starts in 1 hour.</p>
        ${locationLine(item)}
        ${whatsapp}
        <p>We recommend joining a few minutes early to get settled before the session begins.</p>
        ${cta}
        <p style="margin-top:20px;">See you shortly!</p>
        <p style="margin:20px 0 0;">The Voila Africa Team</p>
        ${image}
      `;
    case '30min':
      return `
        <p>Hi ${firstName},</p>
        <p>We're just 30 minutes away from <strong>${item.event_title}</strong>.</p>
        ${locationLine(item)}
        ${whatsapp}
        <p>Get ready for an engaging session. Click the button below when you're ready to join.</p>
        ${cta}
        <p style="margin-top:20px;">See you soon!</p>
        <p style="margin:20px 0 0;">The Voila Africa Team</p>
        ${image}
      `;
  }
}

/** Sends event reminders across five tiers: 3-day, 1-day, day-of, 1-hour,
 * and 30-minute-ahead. Mirrors send-deadline-reminder's overall shape, but
 * loops over REMINDER_TIERS and flips each registration's own per-tier flag
 * via mark_event_reminder_sent after a successful send, since a registrant
 * needs all five reminders independently. */
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

    const webBase = appWebBase();
    const whatsappUrl = whatsappEventsUrl();
    let sent = 0;

    for (const tier of REMINDER_TIERS) {
      const { data: items, error } = await supabase.rpc(tier.rpc, { [tier.arg]: tier.value });

      if (error) {
        return new Response(JSON.stringify({ error: error.message, tier: tier.kind }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!items || items.length === 0) continue;

      const sentIds: string[] = [];

      for (const item of items as ReminderItem[]) {
        if (!item.email) continue;

        const firstName = item.full_name ? item.full_name.split(' ')[0] : 'there';
        const eventUrl = `${webBase}/events/${item.event_slug}`;

        const result = await sendResendEmail({
          apiKey: resendApiKey,
          to: item.email,
          subject: `${item.event_title} ${tier.subject}`,
          html: emailShell({
            bodyHtml: buildBodyHtml(tier, item, firstName, eventUrl, whatsappUrl),
            footerNote: 'You are receiving this because you registered for this event on Voila.',
          }),
        });

        if (result.ok) {
          sent++;
          sentIds.push(item.registration_id);
        }
      }

      if (sentIds.length > 0) {
        await supabase.rpc('mark_event_reminder_sent', {
          p_registration_ids: sentIds,
          p_kind: tier.kind,
        });
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
