"use client";

import { useEffect, useState } from "react";

const SIGNUP_URL =
  (process.env.NEXT_PUBLIC_APP_URL ?? "https://app.olivesforum.com") + "/welcome";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Main navigation"
      className={`sticky top-0 z-50 bg-forest py-3 transition-shadow duration-200 ${
        scrolled ? "shadow-[0_1px_0_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.3)]" : ""
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-6 flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2" aria-label="Olives Forum home">
          <div className="w-9 h-9 rounded-[10px] bg-[rgba(139,201,154,0.2)] border border-[rgba(139,201,154,0.3)] flex items-center justify-center">
            <span className="text-accent font-bold text-lg leading-none">O</span>
          </div>
          <span className="text-white font-bold text-base tracking-tight">Olives Forum</span>
        </a>

        <a
          href={SIGNUP_URL}
          className="flex items-center gap-1.5 bg-white hover:bg-primary text-primary hover:text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150 min-h-[38px]"
        >
          Get started free
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </nav>
  );
}
