import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { requireSuperAdminSession } from '@/lib/admin-session';
import { SuperAdminSubNav } from './SuperAdminSubNav';

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const [, t] = await Promise.all([requireSuperAdminSession(), getTranslations('Admin.superAdmin.nav')]);

  const items = [
    { href: '/admin/super', key: 'overview', label: t('overview') },
    { href: '/admin/super/analytics', key: 'analytics', label: t('analytics') },
    { href: '/admin/super/admins', key: 'admins', label: t('admins') },
    { href: '/admin/super/partners', key: 'partners', label: t('partners') },
    { href: '/admin/super/mentors', key: 'mentors', label: t('mentors') },
    { href: '/admin/super/mentees', key: 'mentees', label: t('mentees') },
    { href: '/admin/super/mentorship-exits', key: 'mentorshipExits', label: t('mentorshipExits') },
    { href: '/admin/super/applications', key: 'applications', label: t('applications') },
  ];

  return (
    <>
      <SuperAdminSubNav items={items} />
      <div className="mt-6">{children}</div>
    </>
  );
}
