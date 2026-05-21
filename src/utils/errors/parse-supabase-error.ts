import type { AuthError, PostgrestError } from '@supabase/supabase-js';

import type { ApiError } from '@/types/api';

export function parseSupabaseError(error: AuthError | PostgrestError | Error): ApiError {
  if ('code' in error && typeof error.code === 'string') {
    return { code: error.code, message: error.message };
  }
  return { code: 'unknown', message: error.message };
}
