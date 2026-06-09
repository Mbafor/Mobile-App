import { useAuthStore } from '@/features/auth/store/auth.store';
import { clearSupabaseAuthStorage } from '@/features/auth/utils/clear-auth-storage';
import { supabase } from '@/services/supabase/client';

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error ?? '');
}

/** True when persisted Supabase tokens can no longer be refreshed. */
export function isInvalidRefreshTokenError(error: unknown): boolean {
  const message = errorMessage(error).toLowerCase();
  return (
    message.includes('invalid refresh token') ||
    message.includes('refresh token not found') ||
    message.includes('refresh_token_not_found')
  );
}

/**
 * Clears broken local auth state after refresh failure.
 * Uses local sign-out only so we do not depend on a valid refresh token.
 */
export async function recoverFromStaleSession(): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // Session may already be gone locally.
  }
  await clearSupabaseAuthStorage();
  useAuthStore.getState().reset();
}
