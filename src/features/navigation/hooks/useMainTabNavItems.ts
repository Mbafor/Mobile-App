import { usePathname, useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/constants/routes';
import { env } from '@/config/env';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { DesktopNavItem } from '@/features/navigation/components/DesktopWebNavigation';

/** Primary app sections — shared by web top nav and drawer menu. */
export function useMainTabNavItems(): DesktopNavItem[] {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isSuperAdmin } = useAuth();
  const { t } = useTranslation();

  return useMemo<DesktopNavItem[]>(
    () => [
      {
        key: 'home',
        label: t('navigation.tabs.home'),
        icon: 'home-outline',
        active: pathname === '/',
        onPress: () => {
          if (typeof window !== 'undefined') {
            window.location.href = env.LANDING_URL;
          }
        },
      },
      {
        key: 'dashboard',
        label: t('navigation.tabs.dashboard'),
        icon: 'grid-outline',
        active: pathname.includes('/dashboard'),
        onPress: () => router.push(ROUTES.MAIN.DASHBOARD as Href),
      },
      {
        key: 'saved',
        label: t('navigation.tabs.saved'),
        icon: 'bookmark-outline',
        active: pathname.includes('/saved'),
        onPress: () => router.push(ROUTES.MAIN.SAVED as Href),
      },
      {
        key: 'tracker',
        label: t('navigation.tabs.tracker'),
        icon: 'clipboard-outline',
        active: pathname.includes('/tracker'),
        onPress: () => router.push('/(main)/(tabs)/tracker' as Href),
      },
      {
        key: 'browse-categories',
        label: t('navigation.tabs.browse'),
        icon: 'grid-outline',
        active: pathname.includes('/browse-categories'),
        onPress: () => router.push('/(main)/(tabs)/browse-categories' as Href),
      },
      {
        key: 'mentorship',
        label: t('navigation.tabs.mentorship'),
        icon: 'people-outline',
        active: pathname.includes('/mentorship'),
        onPress: () => router.push(ROUTES.MAIN.MENTORSHIP as Href),
      },
      {
        key: 'cv-builder',
        label: t('navigation.tabs.cvBuilder'),
        icon: 'document-text-outline',
        active: pathname.includes('/cv-builder'),
        onPress: () => router.push(ROUTES.MAIN.CV_BUILDER.DASHBOARD as Href),
      },
      {
        key: 'notifications',
        label: t('navigation.tabs.notifications'),
        icon: 'notifications-outline',
        active: pathname.includes('/notifications'),
        onPress: () => router.push(ROUTES.MAIN.NOTIFICATIONS as Href),
      },
      {
        key: 'profile',
        label: t('navigation.tabs.profile'),
        icon: 'person-outline',
        active: pathname.includes('/profile'),
        onPress: () => router.push(ROUTES.MAIN.DRAWER.PROFILE as Href),
      },
      {
        key: 'settings',
        label: t('navigation.tabs.settings'),
        icon: 'settings-outline',
        active: pathname.includes('/settings'),
        onPress: () => router.push(ROUTES.MAIN.SETTINGS as Href),
      },
      ...(isAdmin
        ? [
            {
              key: 'admin',
              label: t('navigation.tabs.admin'),
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
              label: t('navigation.tabs.superAdmin'),
              icon: 'planet-outline' as const,
              active: pathname.includes('/super-admin'),
              onPress: () => router.push(ROUTES.SUPER_ADMIN.HOME as Href),
            },
          ]
        : []),
    ],
    [isAdmin, isSuperAdmin, pathname, router, t],
  );
}
