"use client";

import { useEffect, useState } from "react";

const SIGNUP_URL =
  (process.env.NEXT_PUBLIC_APP_URL ?? "https://app.olivesforum.com") + "/welcome";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Main navigation"
      className={`sticky top-0 z-50 bg-white py-2 transition-shadow duration-200 ${
        scrolled ? "shadow-[0_1px_0_rgba(0,0,0,0.06),0_4px_24px_rgba(0,0,0,0.1)]" : ""
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-6 flex flex-wrap items-center justify-between gap-3">
        <a href="/" className="flex items-center gap-2" aria-label="Olives Forum home">
          <div className="w-9 h-9 rounded-[10px] bg-[rgba(26,61,37,0.1)] border border-[rgba(26,61,37,0.15)] flex items-center justify-center">
            <span className="text-primary font-bold text-lg leading-none">O</span>
          </div>
          <span className="text-primary font-bold text-base tracking-tight">Olives Forum</span>
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-[#1A1A1A] transition-colors duration-150 md:hidden"
          aria-label="Toggle navigation menu"
        >
          <span className="w-5 h-0.5 bg-current block rounded-full" />
          <span className="w-5 h-0.5 bg-current block rounded-full mt-1.5" />
          <span className="w-5 h-0.5 bg-current block rounded-full mt-1.5" />
        </button>

        <div
          className={`w-full md:w-auto md:flex md:items-center md:justify-center md:gap-4 ${
            menuOpen ? "block" : "hidden"
          }`}
        >
          <div className="flex flex-col items-center gap-4 pb-4 md:flex-row md:items-center md:pb-0 md:gap-4 md:justify-center w-full">
            <a
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-[#1A1A1A] hover:text-primary transition-colors duration-150"
            >
              About
            </a>
            <a
              href="/mentor"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-[#1A1A1A] hover:text-primary transition-colors duration-150"
            >
              Mentors
            </a>
            <a
              href="/#features"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-[#1A1A1A] hover:text-primary transition-colors duration-150"
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-[#1A1A1A] hover:text-primary transition-colors duration-150"
            >
              How it works
            </a>
          </div>
        </div>

        <a
          href={SIGNUP_URL}
          className="hidden md:inline-flex items-center gap-1.5 bg-primary hover:bg-forest text-white hover:text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150 min-h-[38px]"
        >
          Get started free
        </a>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-white md:hidden">
          <div className="mx-auto max-w-[1200px] px-6 pb-4 pt-3 flex flex-col items-center gap-3">
            <a
              href={SIGNUP_URL}
              onClick={() => setMenuOpen(false)}
              className="w-full text-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-forest"
            >
              Get started free
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
