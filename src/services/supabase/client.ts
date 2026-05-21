import { createClient } from '@supabase/supabase-js';

import { env } from '@/config/env';
import { supabaseStorage } from '@/services/supabase/storage';

import type { Database } from '@/services/supabase/types';

export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    storage: supabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
