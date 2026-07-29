'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { googleCalendarUrl, outlookCalendarUrl, buildIcs, type CalendarEventInput } from '@/lib/calendar';

export function AddToCalendar({ event, dtstamp }: { event: CalendarEventInput; dtstamp: string }) {
  const t = useTranslations('Events.calendar');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function downloadIcs() {
    const content = buildIcs(event, dtstamp);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        {t('addToCalendar')}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <button type="button" aria-label={t('close')} className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-2 w-56 rounded-lg border border-[var(--color-border)] bg-white shadow-lg py-1 left-0">
            <a
              href={googleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-primary/5"
              onClick={() => setOpen(false)}
            >
              {t('google')}
            </a>
            <a
              href={outlookCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-primary/5"
              onClick={() => setOpen(false)}
            >
              {t('outlook')}
            </a>
            <button
              type="button"
              onClick={downloadIcs}
              className="block w-full text-left px-4 py-2 text-sm text-[#1A1A1A] hover:bg-primary/5"
            >
              {t('ics')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
