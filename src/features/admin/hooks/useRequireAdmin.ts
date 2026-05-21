import { useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useRequireAdmin() {
  const router = useRouter();
  const { isAdmin, isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAdmin) {
      router.replace(ROUTES.MAIN.DASHBOARD as Href);
    }
  }, [isAdmin, isAuthReady, router]);

  return { isAdmin, isReady: isAuthReady && isAdmin };
}
