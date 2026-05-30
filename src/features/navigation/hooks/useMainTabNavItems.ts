import { usePathname, useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { DesktopNavItem } from '@/features/navigation/components/DesktopWebNavigation';

/** Primary app sections — shared by web top nav and drawer menu. */
export function useMainTabNavItems(): DesktopNavItem[] {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isSuperAdmin } = useAuth();

  return useMemo<DesktopNavItem[]>(
    () => [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: 'home-outline',
        active: pathname.includes('/dashboard'),
        onPress: () => router.push(ROUTES.MAIN.DASHBOARD as Href),
      },
      {
        key: 'tracker',
        label: 'Tracker',
        icon: 'clipboard-outline',
        active: pathname.includes('/tracker'),
        onPress: () => router.push('/(main)/(tabs)/tracker' as Href),
      },
      {
        key: 'mentorship',
        label: 'Mentorship',
        icon: 'people-outline',
        active: pathname.includes('/mentorship'),
        onPress: () => router.push(ROUTES.MAIN.MENTORSHIP as Href),
      },
      {
        key: 'cv-builder',
        label: 'CV Builder',
        icon: 'document-text-outline',
        active: pathname.includes('/cv-builder'),
        onPress: () => router.push(ROUTES.MAIN.CV_BUILDER.DASHBOARD as Href),
      },
      {
        key: 'browse-categories',
        label: 'Browse',
        icon: 'grid-outline',
        active: pathname.includes('/browse-categories'),
        onPress: () => router.push('/(main)/(tabs)/browse-categories' as Href),
      },
      ...(isAdmin
        ? [
            {
              key: 'admin',
              label: 'Admin',
              icon: 'shield-outline' as const,
              active: pathname.includes('/admin'),
              onPress: () => router.push(ROUTES.ADMIN.HOME as Href),
            },
          ]
        : []),
      ...(isSuperAdmin
        ? [
            {
              key: 'super-admin',
              label: 'Super Admin',
              icon: 'planet-outline' as const,
              active: pathname.includes('/super-admin'),
              onPress: () => router.push(ROUTES.SUPER_ADMIN.HOME as Href),
            },
          ]
        : []),
    ],
    [isAdmin, isSuperAdmin, pathname, router],
  );
}
