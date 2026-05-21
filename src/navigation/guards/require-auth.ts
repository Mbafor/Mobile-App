import { ROUTES } from '@/constants/routes';

export type GuardResult = { allowed: true } | { allowed: false; redirect: string };

/**
 * Returns redirect href when user is not authenticated.
 * Wire to auth store session when implementing auth.
 */
export function requireAuth(isAuthenticated: boolean): GuardResult {
  if (isAuthenticated) return { allowed: true };
  return { allowed: false, redirect: ROUTES.AUTH.WELCOME };
}
