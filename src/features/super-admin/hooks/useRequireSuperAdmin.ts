import { useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useRequireSuperAdmin() {
  const router = useRouter();
  const { isSuperAdmin, isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isSuperAdmin) {
      router.replace(ROUTES.MAIN.DASHBOARD as Href);
    }
  }, [isSuperAdmin, isAuthReady, router]);

  return { isSuperAdmin, isReady: isAuthReady && isSuperAdmin };
}
