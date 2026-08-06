"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { formatShortDateTime } from "@/lib/event-format";
import type { NextEvent } from "@/lib/get-next-event";

const DISMISSED_KEY = "voila:events-banner-dismissed";

export default function EventsBanner() {
  const t = useTranslations("Events.banner");
  const [event, setEvent] = useState<NextEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/events/next")
      .then((res) => res.json())
      .then((body: { event: NextEvent | null }) => {
        if (cancelled || !body.event) return;
        setEvent(body.event);
        const dismissedSlug = window.localStorage.getItem(DISMISSED_KEY);
        setDismissed(dismissedSlug === body.event.slug);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!event || dismissed) return null;

  const when = formatShortDateTime(event.event_date, event.timezone);

  return (
    <div className="w-full bg-accent text-[#1A1A1A]">
      <div className="mx-auto max-w-[1200px] px-4 py-2 flex items-center justify-center gap-3 flex-wrap text-center">
        <span className="text-sm font-medium">
          {t("label", { title: event.title, when })}
        </span>
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center rounded-full bg-primary text-white text-xs font-semibold px-3 py-1 hover:bg-forest transition-colors duration-150"
        >
          {t("cta")}
        </Link>
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(DISMISSED_KEY, event.slug);
            setDismissed(true);
          }}
          aria-label={t("close")}
          className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-black/5 transition-colors duration-150"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
