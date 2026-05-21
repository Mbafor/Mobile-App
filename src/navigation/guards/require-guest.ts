import { ROUTES } from '@/constants/routes';

import type { GuardResult } from '@/navigation/guards/require-auth';

export function requireGuest(isAuthenticated: boolean): GuardResult {
  if (!isAuthenticated) return { allowed: true };
  return {
    allowed: false,
    redirect: ROUTES.MAIN.DASHBOARD,
  };
}
