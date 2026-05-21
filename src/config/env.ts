const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

function assertEnv() {
  if (__DEV__ && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
    console.warn(
      '[OLF] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env',
    );
  }
}

assertEnv();

export const env = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  isConfigured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
} as const;
