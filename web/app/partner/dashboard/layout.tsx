import type { ReactNode } from 'react';

import { requirePartnerSession } from '@/lib/partner-session';
import { PartnerSidebar } from './PartnerSidebar';

export default async function PartnerDashboardLayout({ children }: { children: ReactNode }) {
  const session = await requirePartnerSession();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--color-surface)]">
      <PartnerSidebar orgName={session.partner.org_name} contactEmail={session.partner.contact_email} />
      <main className="flex-1 px-4 py-8">
        <div className="max-w-3xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
