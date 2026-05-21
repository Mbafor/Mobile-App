import { usePathname, useRouter, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

type RedirectMode = 'guest' | 'authenticated' | 'bootstrap' | 'onboarding';

function postAuthRoute(onboardingComplete: boolean): Href {
  return (onboardingComplete ? ROUTES.MAIN.DASHBOARD : ROUTES.ONBOARDING.BASIC_INFO) as Href;
}

export function useAuthRedirect(mode: RedirectMode) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isAuthReady, onboardingComplete } = useAuth();
  const lastTarget = useRef<Href | null>(null);

  useEffect(() => {
    if (!isAuthReady) return;

    let target: Href | null = null;

    if (mode === 'guest' && isAuthenticated) {
      target = postAuthRoute(onboardingComplete);
    } else if (mode === 'bootstrap') {
      target = isAuthenticated ? postAuthRoute(onboardingComplete) : (ROUTES.AUTH.WELCOME as Href);
    } else if (mode === 'authenticated') {
      if (!isAuthenticated) {
        target = ROUTES.AUTH.WELCOME as Href;
      } else if (!onboardingComplete && !pathname.startsWith('/(onboarding)')) {
        target = ROUTES.ONBOARDING.BASIC_INFO as Href;
      }
    } else if (mode === 'onboarding') {
      if (!isAuthenticated) {
        target = ROUTES.AUTH.WELCOME as Href;
      } else if (onboardingComplete) {
        target = ROUTES.MAIN.DASHBOARD as Href;
      }
    }

    if (!target || target === lastTarget.current) return;

    const targetPath = String(target).split('?')[0];
    if (pathname === targetPath || pathname.startsWith(`${targetPath}/`)) {
      lastTarget.current = target;
      return;
    }

    lastTarget.current = target;
    router.replace(target);
  }, [isAuthenticated, isAuthReady, mode, onboardingComplete, pathname, router]);
}
