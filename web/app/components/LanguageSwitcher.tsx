"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { LOCALE_COOKIE, type AppLocale } from "@/i18n/locales";

const LANGUAGES: { code: AppLocale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

export default function LanguageSwitcher({ scrolled }: { scrolled: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("LanguageSwitcher");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function selectLocale(code: AppLocale) {
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; SameSite=Lax`;
    setOpen(false);
    router.refresh();
  }

  const current = LANGUAGES.find((lang) => lang.code === locale) ?? LANGUAGES[0];
  const textClass = scrolled ? "text-[#1A1A1A]" : "text-white";
  const borderClass = scrolled ? "border-[#E0E0E0]" : "border-white/20";
  const hoverBgClass = scrolled ? "hover:bg-primary/5" : "hover:bg-white/10";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("ariaLabel")}
        className={`inline-flex items-center gap-1.5 rounded-lg border ${borderClass} ${textClass} ${hoverBgClass} px-3 py-2 text-sm font-semibold transition-colors duration-150 min-h-[38px]`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20 15.3 15.3 0 010-20z" />
        </svg>
        {current.code.toUpperCase()}
        <svg
          className={`w-3 h-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("ariaLabel")}
          className="absolute right-0 mt-2 w-40 rounded-xl border border-[#E0E0E0] bg-white shadow-lg overflow-hidden z-50"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={lang.code === locale}
              onClick={() => selectLocale(lang.code)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-primary/5 ${
                lang.code === locale ? "text-primary font-semibold" : "text-[#1A1A1A] font-medium"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
