'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { partnerLogout } from '@/app/partner/login/actions';

const NAV_ITEMS = [
  {
    href: '/partner/dashboard',
    label: 'Dashboard',
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
    label: 'Weekly Digest',
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
    label: 'Browse Opportunities',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="9" />
        <path d="m15 9-4.5 1.5L9 15l4.5-1.5Z" />
      </svg>
    ),
  },
  {
    href: '/partner/dashboard/create',
    label: 'Create Opportunity',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
];

export function PartnerSidebar({ orgName, contactEmail }: { orgName: string; contactEmail: string }) {
  const pathname = usePathname();

  const linkClass = (href: string) => {
    const active = pathname === href;
    return `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
      active
        ? 'bg-[var(--color-forest)]/10 text-[var(--color-forest)] font-semibold'
        : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)]'
    }`;
  };

  return (
    <>
      <aside className="hidden md:flex w-[220px] shrink-0 flex-col h-screen sticky top-0 bg-white border-r border-[var(--color-border)]">
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
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto px-3 py-4 border-t border-[var(--color-border)]">
          <form action={partnerLogout}>
            <button type="submit" className="text-sm text-[var(--color-muted)] underline">
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex md:hidden items-center gap-1 overflow-x-auto border-b border-[var(--color-border)] bg-white px-3 py-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${
              pathname === item.href
                ? 'bg-[var(--color-forest)]/10 text-[var(--color-forest)] font-semibold'
                : 'text-[var(--color-muted)]'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
}
