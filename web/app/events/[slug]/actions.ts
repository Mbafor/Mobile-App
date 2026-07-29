'use server';

import { createServiceRoleClient } from '@/lib/supabase-server';
import { generateRegistrationRef, formatFullDate, formatTimeRange } from '@/lib/event-format';
import { buildIcs } from '@/lib/calendar';
import { sendEventConfirmationEmail } from '@/lib/email';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://voila-africa.com').replace(/\/$/, '');

export type RegisterEventResult =
  | {
      ok: true;
      registrationRef: string;
      isExistingUser: boolean;
      meetingLink: string | null;
    }
  | { ok: false; message: string };

/** Registers a student for an event: inserts the row (service role -- there's
 * no public insert policy on event_registrations, see 055_event_registrations.sql),
 * flags whether the email already belongs to a Voila account, and sends a
 * confirmation email with a .ics attachment. Email failure doesn't fail the
 * registration -- the row is the source of truth, the email is best-effort.
 *
 * Takes only eventId from the client and re-fetches the event row itself
 * (rather than trusting a client-supplied event object) for two reasons:
 * meeting_link must stay server-side until a registration actually succeeds
 * (props passed into a client component are visible in the RSC payload even
 * if unrendered, so RegistrationForm never receives it pre-registration),
 * and capacity must be checked against the real DB value, not a value the
 * client could tamper with. */
export async function registerForEvent(eventId: string, formData: FormData): Promise<RegisterEventResult> {
  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const whatsapp = String(formData.get('whatsapp') ?? '').trim();

  if (!fullName) return { ok: false, message: 'Enter your full name.' };
  if (!email || !email.includes('@')) return { ok: false, message: 'Enter a valid email address.' };

  const supabase = createServiceRoleClient();

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select(
      'id, slug, title, description, event_date, end_time, timezone, location_type, location_platform, meeting_link, capacity, status, image_url',
    )
    .eq('id', eventId)
    .neq('status', 'cancelled')
    .maybeSingle();

  if (eventError || !event) return { ok: false, message: 'This event could not be found.' };

  if (event.capacity) {
    const { data: count } = await supabase.rpc('get_event_registration_count', { p_event_id: event.id });
    if (typeof count === 'number' && count >= event.capacity) {
      return { ok: false, message: 'This event is full.' };
    }
  }

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  const isExistingUser = Boolean(existingProfile);

  let registrationRef = generateRegistrationRef();
  let insertError: { code?: string; message: string } | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const { error } = await supabase.from('event_registrations').insert({
      event_id: event.id,
      full_name: fullName,
      email,
      whatsapp: whatsapp || null,
      is_existing_user: isExistingUser,
      registration_ref: registrationRef,
    });

    if (!error) {
      insertError = null;
      break;
    }

    // Unique violation on (event_id, lower(email)) means they already registered;
    // unique violation on registration_ref (astronomically unlikely) just needs a retry.
    if (error.code === '23505' && error.message.includes('event_registrations_event_email')) {
      return { ok: false, message: "You're already registered for this event -- check your inbox for the confirmation." };
    }
    if (error.code === '23505') {
      registrationRef = generateRegistrationRef();
      insertError = error;
      continue;
    }

    insertError = error;
    break;
  }

  if (insertError) return { ok: false, message: insertError.message };

  const eventUrl = `${SITE_URL}/events/${event.slug}`;
  const revealedMeetingLink = event.location_type === 'virtual' ? event.meeting_link : null;
  const icsContent = buildIcs(
    {
      uid: `${event.id}@voila-africa.com`,
      title: event.title,
      description: event.description,
      location: event.location_platform ?? (event.location_type === 'virtual' ? 'Online' : ''),
      startTime: event.event_date,
      endTime: event.end_time ?? event.event_date,
      url: eventUrl,
    },
    new Date().toISOString(),
  );

  const emailResult = await sendEventConfirmationEmail({
    to: email,
    fullName,
    eventTitle: event.title,
    eventUrl,
    eventImageUrl: event.image_url,
    dateLabel: formatFullDate(event.event_date, event.timezone),
    timeLabel: formatTimeRange(event.event_date, event.end_time, event.timezone),
    registrationRef,
    icsContent,
  });

  if (!emailResult.ok) {
    console.error('Event confirmation email failed:', emailResult.error);
  } else {
    console.log('Event confirmation email sent, Resend id:', emailResult.id);
  }

  return {
    ok: true,
    registrationRef,
    isExistingUser,
    meetingLink: revealedMeetingLink,
  };
}
