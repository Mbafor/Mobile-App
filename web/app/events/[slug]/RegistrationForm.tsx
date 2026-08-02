'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { registerForEvent } from './actions';
import { AddToCalendar } from './AddToCalendar';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.voila-africa.com';
const WHATSAPP_EVENTS_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_EVENTS_URL ?? 'https://chat.whatsapp.com/KeUzay1i8sd5jD1VyzSbgG';

const inputClass =
  'w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

export function RegistrationForm({
  eventId,
  eventTitle,
  eventDescription,
  eventDate,
  endTime,
  locationLabel,
  registrationCount,
  capacity,
}: {
  eventId: string;
  eventTitle: string;
  eventDescription: string;
  eventDate: string;
  endTime: string | null;
  locationLabel: string;
  registrationCount: number;
  capacity: number | null;
}) {
  const t = useTranslations('Events.register');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ registrationRef: string; isExistingUser: boolean; meetingLink: string | null } | null>(
    null,
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const isFull = capacity !== null && registrationCount >= capacity;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await registerForEvent(eventId, formData);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setResult(res);
    });
  }

  if (result) {
    const signupUrl = `${APP_URL}/welcome?name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}`;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-semibold text-base">{t('successTitle')}</h3>
        </div>
        <p className="text-sm text-[var(--color-muted)]">{t('successSubtitle')}</p>

        <div className="rounded-lg bg-primary/5 border border-primary/15 px-4 py-3">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-0.5">{t('referenceLabel')}</p>
          <p className="text-sm font-mono font-semibold text-[#1A1A1A]">{result.registrationRef}</p>
        </div>

        {result.meetingLink && (
          <div className="rounded-lg border border-[var(--color-border)] px-4 py-3">
            <p className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-1">
              {t('joinLinkLabel')}
            </p>
            <a href={result.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-medium break-all hover:underline">
              {result.meetingLink}
            </a>
          </div>
        )}

        <div className="rounded-lg bg-[#25D366]/10 border border-[#25D366]/25 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 shrink-0" fill="#25D366" viewBox="0 0 24 24">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 004.74 1.2h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.02c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.79-4.18-4.93-4.37-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36l.55.01c.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.37-.44.5-.15.15-.3.31-.13.6.17.29.75 1.24 1.61 2 1.11.99 2.04 1.3 2.33 1.44.29.15.46.13.63-.08.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.93.28.14.47.21.54.33.07.12.07.68-.17 1.36z" />
            </svg>
            <p className="text-[11px] font-semibold text-[#128C4A] uppercase tracking-wide">{t('whatsappTitle')}</p>
          </div>
          <p className="text-sm text-[#1A1A1A] mb-2">{t('whatsappBody')}</p>
          <a
            href={WHATSAPP_EVENTS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-semibold text-[#128C4A] hover:underline"
          >
            {t('whatsappCta')} →
          </a>
        </div>

        <AddToCalendar
          event={{
            uid: `${eventId}@voila-africa.com`,
            title: eventTitle,
            description: eventDescription,
            location: result.meetingLink ?? locationLabel,
            startTime: eventDate,
            endTime: endTime ?? eventDate,
          }}
          dtstamp={eventDate}
        />

        {!result.isExistingUser && (
          <a
            href={signupUrl}
            className="block text-center rounded-md bg-primary text-white py-2.5 text-sm font-semibold hover:opacity-90 transition"
          >
            {t('createAccountCta')}
          </a>
        )}
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div>
        <h3 className="text-lg font-bold text-[#1A1A1A]">{t('free')}</h3>
        <p className="text-xs text-[var(--color-muted)]">{t('freeSubtext')}</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-[#1A1A1A]">{t('reserveSpot')}</p>
        <p className="text-xs text-[var(--color-muted)]">{t('reserveSpotSubtext')}</p>
      </div>

      {capacity !== null && (
        <p className="text-xs font-medium text-primary">
          {t('spotsFilled', { filled: registrationCount, total: capacity })}
        </p>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

      {isFull ? (
        <p className="text-sm text-[var(--color-muted)] bg-[var(--color-surface)] rounded-md px-3 py-2">{t('full')}</p>
      ) : (
        <>
          <input
            name="fullName"
            required
            placeholder={t('namePlaceholder')}
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            name="email"
            type="email"
            required
            placeholder={t('emailPlaceholder')}
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div>
            <input name="whatsapp" placeholder={t('whatsappPlaceholder')} className={inputClass} />
            <p className="text-[11px] text-[var(--color-muted)] mt-1">{t('optional')}</p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-primary text-white py-2.5 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition"
          >
            {isPending ? t('submitting') : t('submit')}
          </button>

          <p className="flex items-center gap-1.5 text-[11px] text-[var(--color-muted)]">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {t('trustLine')}
          </p>
        </>
      )}
    </form>
  );
}
