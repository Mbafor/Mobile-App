import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/services/supabase/client';

/** Allows event admins and super admins to access event management screens. */
export function useCanManageEvents(fallbackRoute: Href = ROUTES.MAIN.DASHBOARD as Href) {
  const router = useRouter();
  const { user, isHydrating: authLoading } = useAuth();
  const [canManage, setCanManage] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(fallbackRoute);
      return;
    }

    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase.rpc('current_user_can_manage_events');
      if (cancelled) return;
      if (error || !data) {
        router.replace(fallbackRoute);
        setCanManage(false);
        return;
      }
      setCanManage(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, router, fallbackRoute]);

  return { isReady: canManage === true };
}
