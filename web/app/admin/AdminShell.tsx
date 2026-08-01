import type { ReactNode } from 'react';
import { cookies } from 'next/headers';

import { requireAdminSession } from '@/lib/admin-session';
import { defaultTheme, isSupportedTheme, THEME_COOKIE } from '@/theme/theme';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

/** Shared chrome for every authenticated /admin/* page -- desktop sidebar +
 * mobile drawer nav + top bar, matching the pattern already proven by the
 * partner dashboard (web/app/partner/dashboard/layout.tsx: PartnerSidebar +
 * PartnerHeader + PartnerMobileNav). Each admin route's own layout.tsx still
 * does its own auth check (requireAdminSession or requireSuperAdminSession)
 * before rendering this, since some sections need the stronger check; the
 * requireAdminSession call here is a cheap cache() hit, not a second request. */
export async function AdminShell({ children }: { children: ReactNode }) {
  const [session, cookieStore] = await Promise.all([requireAdminSession(), cookies()]);
  const cookieTheme = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isSupportedTheme(cookieTheme) ? cookieTheme : defaultTheme;
  const name = session.admin.full_name ?? session.admin.email ?? 'Admin';

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-[var(--color-surface)] text-[#1A1A1A] dark:text-white">
      <AdminSidebar name={name} isSuperAdmin={session.admin.is_super_admin} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader name={name} isSuperAdmin={session.admin.is_super_admin} theme={theme} />
        <main className="flex-1 px-4 py-6 md:py-8">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
