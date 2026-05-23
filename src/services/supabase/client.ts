import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { env } from '@/config/env';
import { supabaseStorage } from '@/services/supabase/storage';

import type { Database } from '@/services/supabase/types';

export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    storage: supabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    /** Web OAuth returns ?code= to /auth/callback — must parse the URL. */
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
  },
});
