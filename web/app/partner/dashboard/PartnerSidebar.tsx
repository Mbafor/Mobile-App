'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { partnerLogout } from '@/app/partner/login/actions';

export const NAV_ITEMS = [
  {
    href: '/partner/dashboard',
    key: 'dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/partner/dashboard/digest',
    key: 'digest',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18" />
        <path d="M8 2v4M16 2v4" />
      </svg>
    ),
  },
  {
    href: '/partner/dashboard/browse',
    key: 'browse',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="9" />
        <path d="m15 9-4.5 1.5L9 15l4.5-1.5Z" />
      </svg>
    ),
  },
  {
    href: '/partner/dashboard/create',
    key: 'create',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    href: '/partner/dashboard/events',
    key: 'events',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 3v4M16 3v4" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" />
      </svg>
    ),
  },
] as const;

export function PartnerSidebar({ orgName, contactEmail }: { orgName: string; contactEmail: string }) {
  const pathname = usePathname();
  const t = useTranslations('Partner.nav');

  const linkClass = (href: string) => {
    const active = pathname === href;
    return `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
      active
        ? 'bg-[var(--color-forest)]/10 text-[var(--color-forest)] font-semibold'
        : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)]'
    }`;
  };

  return (
    <aside className="hidden md:flex w-[220px] shrink-0 flex-col h-screen sticky top-0 bg-[var(--color-background)] border-r border-[var(--color-border)]">
      <div className="px-4 py-5 border-b border-[var(--color-border)]">
        <p className="font-semibold text-[var(--color-forest)] truncate" title={orgName}>
          {orgName}
        </p>
        <p className="text-xs text-[var(--color-muted)] truncate" title={contactEmail}>
          {contactEmail}
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            {item.icon}
            <span>{t(item.key)}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto px-3 py-4 border-t border-[var(--color-border)]">
        <form action={partnerLogout}>
          <button type="submit" className="text-sm text-[var(--color-muted)] underline">
            {t('logout')}
          </button>
        </form>
      </div>
    </aside>
  );
}
