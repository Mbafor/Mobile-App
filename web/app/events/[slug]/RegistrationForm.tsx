'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { registerForEvent } from './actions';
import { AddToCalendar } from './AddToCalendar';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.voila-africa.com';

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
