"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SIGNUP_URL =
  (process.env.NEXT_PUBLIC_APP_URL ?? "https://app.olivesforum.com") + "/welcome";

export default function Nav() {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onHashChange = () => setActiveHash(window.location.hash);
    onHashChange();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBgClass = scrolled ? "bg-white" : "bg-primary";
  const activeLinkClass = scrolled
    ? "text-primary border-primary pb-1"
    : "text-white border-white pb-1";
  const inactiveLinkClass = scrolled
    ? "text-[#1A1A1A] hover:text-primary hover:border-b-2 hover:border-primary hover:pb-1"
    : "text-white hover:text-accent hover:border-b-2 hover:border-white hover:pb-1";

  return (
    <nav
      aria-label="Main navigation"
      className={`sticky top-0 left-0 right-0 z-50 w-full ${navBgClass} py-2 transition-all duration-200 ${
        scrolled ? "shadow-[0_1px_0_rgba(0,0,0,0.06),0_4px_24px_rgba(0,0,0,0.1)]" : ""
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-6 flex flex-wrap items-center justify-between gap-3">
        <a href="/" className="flex items-center gap-2" aria-label="Olives Forum home">
          <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${scrolled ? "bg-surface border-border" : "bg-white border-white"}`}>
            <span className={`${scrolled ? "text-primary" : "text-primary"} font-bold text-lg leading-none`}>O</span>
          </div>
          <span className={`${scrolled ? "text-[#1A1A1A]" : "text-white"} font-bold text-base tracking-tight`}>Olives Forum</span>
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className={`ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-150 md:hidden bg-transparent ${scrolled ? "text-primary" : "text-white"}`}
          aria-label="Toggle navigation menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>

        <div className="hidden md:flex md:items-center md:justify-center md:gap-4">
          <div className="flex items-center gap-4">
            <a
              href="/about"
              className={`text-sm font-semibold transition-all duration-150 ${
                pathname === "/about" ? activeLinkClass : inactiveLinkClass
              }`}
            >
              About
            </a>
            <a
              href="/mentor"
              className={`text-sm font-semibold transition-all duration-150 ${
                pathname === "/mentor" ? activeLinkClass : inactiveLinkClass
              }`}
            >
              Mentors
            </a>
            <a
              href="/#features"
              className={`text-sm font-semibold transition-all duration-150 ${
                activeHash === "#features" ? activeLinkClass : inactiveLinkClass
              }`}
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              className={`text-sm font-semibold transition-all duration-150 ${
                activeHash === "#how-it-works" ? activeLinkClass : inactiveLinkClass
              }`}
            >
              How it works
            </a>
          </div>
        </div>

        <a
          href={SIGNUP_URL}
          className={`hidden md:inline-flex items-center gap-1.5 font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150 min-h-[38px] ${
            scrolled ? "bg-primary hover:bg-forest text-white" : "bg-white hover:bg-accent text-primary"
          }`}
        >
          Get started free
        </a>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/30"
            aria-label="Close navigation menu"
          />
          <div className="absolute inset-y-0 right-0 w-[min(320px,88vw)] bg-white shadow-2xl p-6 flex flex-col gap-6 overflow-y-auto">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="self-end inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-[#1A1A1A]"
              aria-label="Close menu"
            >
              <span className="block h-0.5 w-5 rotate-45 bg-current" />
              <span className="block h-0.5 w-5 -rotate-45 bg-current -mt-0.5" />
            </button>
            <div className="flex flex-col gap-4">
              <a
                href="/about"
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-semibold transition-all duration-150 ${
                  pathname === "/about" ? activeLinkClass : inactiveLinkClass
                }`}
              >
                About
              </a>
              <a
                href="/mentor"
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-semibold transition-all duration-150 ${
                  pathname === "/mentor" ? activeLinkClass : inactiveLinkClass
                }`}
              >
                Mentors
              </a>
              <a
                href="/#features"
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-semibold transition-all duration-150 ${
                  activeHash === "#features" ? activeLinkClass : inactiveLinkClass
                }`}
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-semibold transition-all duration-150 ${
                  activeHash === "#how-it-works" ? activeLinkClass : inactiveLinkClass
                }`}
              >
                How it works
              </a>
            </div>
            <a
              href={SIGNUP_URL}
              onClick={() => setMenuOpen(false)}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-forest"
            >
              Get started free
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
