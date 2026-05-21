import { ROUTES } from '@/constants/routes';

import type { GuardResult } from '@/navigation/guards/require-auth';
import type { UserRole } from '@/types/domain';

export function requireAdmin(role: UserRole): GuardResult {
  if (role === 'admin') return { allowed: true };
  return { allowed: false, redirect: ROUTES.MAIN.DASHBOARD };
}
