import type { ReactNode } from 'react';
import { cookies } from 'next/headers';

import { requirePartnerSession } from '@/lib/partner-session';
import { defaultTheme, isSupportedTheme, THEME_COOKIE } from '@/theme/theme';
import { PartnerSidebar } from './PartnerSidebar';
import { PartnerHeader } from './PartnerHeader';

export default async function PartnerDashboardLayout({ children }: { children: ReactNode }) {
  const [session, cookieStore] = await Promise.all([requirePartnerSession(), cookies()]);
  const cookieTheme = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isSupportedTheme(cookieTheme) ? cookieTheme : defaultTheme;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--color-surface)] text-[#1A1A1A] dark:text-white">
      <PartnerSidebar orgName={session.partner.org_name} contactEmail={session.partner.contact_email} />
      <div className="flex-1 flex flex-col min-w-0">
        <PartnerHeader
          orgName={session.partner.org_name}
          contactEmail={session.partner.contact_email}
          theme={theme}
        />
        <main className="flex-1 px-4 py-6 md:py-8">
          <div className="max-w-3xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
