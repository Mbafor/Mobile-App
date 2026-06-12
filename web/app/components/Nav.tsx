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
          className={`ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-150 md:hidden ${scrolled ? "border-border bg-white text-[#1A1A1A]" : "border-white bg-white text-[#1A1A1A]"}`}
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
        <div className={`border-t ${scrolled ? "border-border bg-white" : "border-white bg-primary"} md:hidden`}>
          <div className="mx-auto max-w-[1200px] px-6 pb-4 pt-3 flex flex-col items-center gap-3">
            <a
              href={SIGNUP_URL}
              onClick={() => setMenuOpen(false)}
              className={`w-full text-center rounded-lg px-4 py-3 text-sm font-semibold transition-colors duration-150 ${
                scrolled ? "bg-primary text-white hover:bg-forest" : "bg-white text-primary hover:bg-accent"
              }`}
            >
              Get started free
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
