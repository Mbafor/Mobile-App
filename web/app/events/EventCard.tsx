import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { formatDateBadge, formatTimeRange } from '@/lib/event-format';

export interface EventCardData {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  event_date: string;
  end_time: string | null;
  timezone: string;
  location_type: string;
  image_url: string | null;
  category: string | null;
  host_name: string | null;
}

const PLACEHOLDER_COLORS = ['#0B6623', '#2D6040', '#3D7A50', '#1A4D2E', '#5A8F6B'];

export async function EventCard({ event }: { event: EventCardData }) {
  const t = await getTranslations('Events.card');
  const badge = formatDateBadge(event.event_date, event.timezone);
  const timeLabel = formatTimeRange(event.event_date, event.end_time, event.timezone);
  const isOnline = event.location_type === 'virtual';
  const color = PLACEHOLDER_COLORS[event.title.charCodeAt(0) % PLACEHOLDER_COLORS.length];

  return (
    <Link
      href={`/events/${event.slug}`}
      className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-40 w-full">
        {event.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: color }}>
            <span className="text-white font-bold opacity-80" style={{ fontSize: 40, lineHeight: 1 }}>
              {event.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white rounded-lg px-2.5 py-1 text-center shadow-sm">
          <p className="text-[10px] font-bold text-primary leading-none">{badge.month}</p>
          <p className="text-sm font-bold text-[#1A1A1A] leading-none mt-0.5">{badge.day}</p>
        </div>
        <span className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#1A1A1A] shadow-sm">
          {isOnline ? t('online') : t('inPerson')}
        </span>
      </div>

      <div className="p-4">
        <p className="text-[11px] font-semibold text-primary mb-1.5">{timeLabel}</p>
        <h3 className="text-[#1A1A1A] font-semibold text-sm leading-snug line-clamp-2 mb-1.5">{event.title}</h3>
        {(event.tagline || event.description) && (
          <p className="text-[#6B6B6B] text-xs leading-relaxed line-clamp-2 mb-3">
            {event.tagline || event.description}
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/5 border border-primary/15 text-primary text-[11px] font-semibold px-2.5 py-1">
            {t('free')}
          </span>
          {event.host_name && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#6B6B6B] truncate">
              {t('hostedBy', { name: event.host_name })}
              <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
