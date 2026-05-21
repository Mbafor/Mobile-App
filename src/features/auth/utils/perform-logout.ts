import { router } from 'expo-router';

import { ROUTES } from '@/constants/routes';

export async function performLogout(signOut: () => Promise<unknown>): Promise<boolean> {
  const result = await signOut();
  if (result === null) {
    return false;
  }
  router.replace(ROUTES.AUTH.WELCOME);
  return true;
}
