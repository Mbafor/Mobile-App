import type { ReactNode } from 'react';

import { AdminShell } from '../AdminShell';

/** Single shared shell for every authenticated /admin/* route. Kept as one
 * layout (instead of one per section) so Next.js preserves the sidebar/header
 * across navigations between sections instead of remounting them on every
 * click -- see AdminShell for the session check this relies on. The /admin
 * login and auth callback routes live outside the (shell) group, so they
 * never get wrapped in this authenticated chrome. */
export default function AdminRouteGroupLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
