import { Platform } from 'react-native';
import { router } from 'expo-router';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { clearSupabaseAuthStorage } from '@/features/auth/utils/clear-auth-storage';
import { ROUTES } from '@/constants/routes';
import { env } from '@/config/env';
import { authApi, pushTokensApi } from '@/services/api';
import { queryClient } from '@/store/query-client';

export type LogoutResult = { ok: true } | { ok: false; error: string };

export async function performLogout(): Promise<LogoutResult> {
  try {
    const userId = useAuthStore.getState().session?.user?.id;
    if (userId) {
      await pushTokensApi.removeAllForUser(userId);
    }

    queryClient.clear();

    const { error } = await authApi.signOut();
    if (error) {
      return { ok: false, error: error.message };
    }

    await clearSupabaseAuthStorage();

    useAuthStore.getState().reset();

    if (router.canDismiss()) {
      router.dismissAll();
    }

    if (Platform.OS === 'web') {
      window.location.href = env.LANDING_URL;
    } else {
      router.replace(ROUTES.AUTH.WELCOME);
    }

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not log out. Please try again.';
    return { ok: false, error: message };
  }
}
