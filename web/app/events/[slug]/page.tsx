import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { createServiceRoleClient } from '@/lib/supabase-server';
import { formatDateBadge, formatFullDate, formatTimeRange } from '@/lib/event-format';
import { AddToCalendar } from './AddToCalendar';
import { RegistrationForm } from './RegistrationForm';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface EventRow {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  takeaways: string[];
  host_name: string | null;
  host_bio: string | null;
  event_date: string;
  end_time: string | null;
  timezone: string;
  location_type: string;
  location_platform: string | null;
  meeting_link: string | null;
  image_url: string | null;
  capacity: number | null;
  category: string | null;
  status: string;
}

async function getEvent(slug: string): Promise<EventRow | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from('events')
    .select(
      'id, slug, title, tagline, description, takeaways, host_name, host_bio, event_date, end_time, timezone, location_type, location_platform, meeting_link, image_url, capacity, category, status',
    )
    .eq('slug', slug)
    .neq('status', 'cancelled')
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: 'Event | Voila Africa' };
  return {
    title: `${event.title} | Voila Africa`,
    description: event.tagline ?? event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.tagline ?? event.description.slice(0, 160),
      images: event.image_url ? [event.image_url] : undefined,
    },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const supabase = createServiceRoleClient();
  const [{ data: registrationCount }, t] = await Promise.all([
    supabase.rpc('get_event_registration_count', { p_event_id: event.id }),
    getTranslations('Events.single'),
  ]);

  const badge = formatDateBadge(event.event_date, event.timezone);
  const isOnline = event.location_type === 'virtual';
  const dateLabel = formatFullDate(event.event_date, event.timezone);
  const timeLabel = formatTimeRange(event.event_date, event.end_time, event.timezone);
  const descriptionParagraphs = event.description.split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--color-surface)]">
      <div className="max-w-[1000px] mx-auto px-6 py-8">
        <div className="relative rounded-2xl overflow-hidden bg-primary h-64 md:h-80">
          {event.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          )}
          <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-1.5 text-center shadow-sm">
            <p className="text-[11px] font-bold text-primary leading-none">{badge.month}</p>
            <p className="text-base font-bold text-[#1A1A1A] leading-none mt-1">{badge.day}</p>
          </div>
          <span className="absolute top-4 right-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#1A1A1A] shadow-sm">
            {isOnline ? t('online') : t('inPerson')}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 mt-4">
          <span className="inline-flex items-center rounded-full bg-primary/5 border border-primary/15 text-primary text-xs font-semibold px-3 py-1.5">
            {isOnline ? t('online') : t('inPerson')}
          </span>
          <a
            href="#register"
            className="inline-flex items-center rounded-full bg-primary text-white text-sm font-semibold px-5 py-2 hover:opacity-90 transition"
          >
            {t('registerButton')}
          </a>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mt-4">{event.title}</h1>
        {event.tagline && <p className="text-[var(--color-muted)] mt-1.5">{event.tagline}</p>}

        {event.host_name && (
          <p className="flex items-center gap-1.5 text-sm text-[#1A1A1A] mt-3">
            {t('hostedBy', { name: event.host_name })}
            <svg className="w-4 h-4 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mt-8">
          <div className="space-y-6 min-w-0">
            <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
              <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-2">
                {t('dateTimeLabel')}
              </p>
              <p className="text-base font-semibold text-[#1A1A1A]">{dateLabel}</p>
              <p className="text-sm text-[var(--color-muted)] mt-0.5">{timeLabel}</p>
              <div className="mt-3">
                <AddToCalendar
                  event={{
                    uid: `${event.id}@voila-africa.com`,
                    title: event.title,
                    description: event.description,
                    location: event.location_platform ?? (isOnline ? 'Online' : ''),
                    startTime: event.event_date,
                    endTime: event.end_time ?? event.event_date,
                  }}
                  dtstamp={event.event_date}
                />
              </div>
            </section>

            <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
              <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-2">
                {t('locationLabel')}
              </p>
              <p className="text-base font-semibold text-[#1A1A1A]">
                {event.location_platform || (isOnline ? t('online') : t('inPerson'))}
              </p>
              {isOnline && (
                <p className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] mt-1.5">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {t('linkAfterRegistration')}
                </p>
              )}
            </section>

            {descriptionParagraphs.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">{t('aboutTitle')}</h2>
                <div className="space-y-3 text-sm text-[#333333] leading-relaxed">
                  {descriptionParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            )}

            {event.takeaways.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">{t('takeawaysTitle')}</h2>
                <ul className="space-y-2">
                  {event.takeaways.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#333333]">
                      <svg className="w-4 h-4 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(event.host_name || event.host_bio) && (
              <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-2">
                  {t('hostBioLabel')}
                </p>
                {event.host_name && <p className="font-semibold text-[#1A1A1A]">{event.host_name}</p>}
                {event.host_bio && <p className="text-sm text-[#333333] leading-relaxed mt-2">{event.host_bio}</p>}
              </section>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start" id="register">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5 shadow-sm">
              <RegistrationForm
                eventId={event.id}
                eventTitle={event.title}
                eventDescription={event.description}
                eventDate={event.event_date}
                endTime={event.end_time}
                locationLabel={event.location_platform ?? (isOnline ? 'Online' : 'In person')}
                registrationCount={typeof registrationCount === 'number' ? registrationCount : 0}
                capacity={event.capacity}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
      </main>
    </>
  );
}
