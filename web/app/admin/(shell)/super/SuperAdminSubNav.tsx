'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SuperAdminSubNav({ items }: { items: { href: string; key: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-[var(--color-border)]">
      {items.map((item) => {
        const active = item.href === '/admin/super' ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`whitespace-nowrap px-3 py-3 text-sm font-medium border-b-2 transition ${
              active
                ? 'text-primary border-primary'
                : 'text-[var(--color-muted)] border-transparent hover:text-primary hover:border-primary/40'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
