'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { adminLogout } from './login/actions';
import { ADMIN_NAV_ITEMS, ADMIN_SUPER_NAV_ITEM } from './AdminNavItems';
import { isAdminNavActive } from './AdminSidebar';

export function AdminMobileNav({ name, isSuperAdmin }: { name: string; isSuperAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('Admin.header');
  const items = isSuperAdmin ? [...ADMIN_NAV_ITEMS, ADMIN_SUPER_NAV_ITEM] : ADMIN_NAV_ITEMS;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const linkClass = (href: string) => {
    const active = isAdminNavActive(href, pathname);
    return `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
      active
        ? 'bg-primary/10 text-primary font-semibold'
        : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)]'
    }`;
  };

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('menu')}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-primary"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-[260px] max-w-[80vw] flex-col bg-[var(--color-background)] shadow-xl">
            <div className="flex items-center justify-between gap-3 px-4 py-5 border-b border-[var(--color-border)]">
              <div className="min-w-0">
                <p className="font-semibold text-primary truncate">{t('title')}</p>
                <p className="text-xs text-[var(--color-muted)] truncate" title={name}>
                  {name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('close')}
                className="shrink-0 p-1 text-[var(--color-muted)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {items.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={linkClass(item.href)}>
                  {item.icon}
                  <span>{t(item.key)}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-auto px-3 py-4 border-t border-[var(--color-border)]">
              <form action={adminLogout}>
                <button type="submit" className="text-sm text-[var(--color-muted)] underline">
                  {t('signOut')}
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
