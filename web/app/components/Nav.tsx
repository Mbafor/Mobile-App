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
      className={`sticky top-0 z-50 bg-white py-3 transition-shadow duration-200 ${
        scrolled ? "shadow-[0_1px_0_rgba(0,0,0,0.06),0_4px_24px_rgba(0,0,0,0.1)]" : ""
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-6 flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2" aria-label="Olives Forum home">
          <div className="w-9 h-9 rounded-[10px] bg-[rgba(26,61,37,0.1)] border border-[rgba(26,61,37,0.15)] flex items-center justify-center">
            <span className="text-primary font-bold text-lg leading-none">O</span>
          </div>
          <span className="text-primary font-bold text-base tracking-tight">Olives Forum</span>
        </a>

        <a
          href={SIGNUP_URL}
          className="flex items-center gap-1.5 bg-primary hover:bg-forest text-white hover:text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150 min-h-[38px]"
        >
          Get started free
        
        </a>
      </div>
    </nav>
  );
}
