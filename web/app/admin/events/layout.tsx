import type { ReactNode } from 'react';

import { requireAdminSession } from '@/lib/admin-session';
import { AdminHeader } from '../AdminHeader';

export default async function AdminEventsLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[#1A1A1A]">
      <AdminHeader name={session.admin.full_name ?? session.admin.email ?? 'Admin'} />
      <main className="px-4 py-6 md:py-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
