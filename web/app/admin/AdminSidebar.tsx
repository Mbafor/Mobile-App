'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { adminLogout } from './login/actions';
import { ADMIN_NAV_ITEMS, ADMIN_SUPER_NAV_ITEM } from './AdminNavItems';

export function isAdminNavActive(href: string, pathname: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ name, isSuperAdmin }: { name: string; isSuperAdmin: boolean }) {
  const pathname = usePathname();
  const t = useTranslations('Admin.header');
  const items = isSuperAdmin ? [...ADMIN_NAV_ITEMS, ADMIN_SUPER_NAV_ITEM] : ADMIN_NAV_ITEMS;

  const linkClass = (href: string) => {
    const active = isAdminNavActive(href, pathname);
    return `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
      active
        ? 'bg-primary/10 text-primary font-semibold'
        : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)]'
    }`;
  };

  return (
    <aside className="hidden sm:flex w-[220px] shrink-0 flex-col h-screen sticky top-0 bg-[var(--color-background)] border-r border-[var(--color-border)]">
      <div className="px-4 py-5 border-b border-[var(--color-border)]">
        <p className="font-semibold text-primary truncate" title={name}>
          {t('title')}
        </p>
        <p className="text-xs text-[var(--color-muted)] truncate" title={name}>
          {name}
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
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
  );
}
