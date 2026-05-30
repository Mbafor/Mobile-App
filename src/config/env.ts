const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const PAYSTACK_PUBLIC_KEY = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
const API_PORT = process.env.EXPO_PUBLIC_API_PORT ?? '3000';
const LANDING_URL = process.env.EXPO_PUBLIC_LANDING_URL ?? 'http://localhost:3000';

const PLACEHOLDER_URL_PATTERNS = [
  'your_project',
  'YOUR_PROJECT',
  'example.supabase',
  'xxx.supabase',
];

function isPlaceholderUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return PLACEHOLDER_URL_PATTERNS.some((p) => lower.includes(p.toLowerCase()));
}

function isPlaceholderKey(key: string): boolean {
  const lower = key.toLowerCase();
  return (
    lower.includes('your_supabase') ||
    lower.includes('your_anon') ||
    lower === 'anon_key' ||
    key.length < 20
  );
}

function validateEnv(): string | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return 'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env';
  }
  if (isPlaceholderUrl(SUPABASE_URL)) {
    return `Supabase URL is still a placeholder (${SUPABASE_URL}). Copy your real project URL from Supabase → Project Settings → API into .env, then restart Expo with: npx expo start -c`;
  }
  if (!SUPABASE_URL.startsWith('https://') || !SUPABASE_URL.includes('.supabase.co')) {
    return `EXPO_PUBLIC_SUPABASE_URL does not look valid: ${SUPABASE_URL}`;
  }
  if (isPlaceholderKey(SUPABASE_ANON_KEY)) {
    return 'EXPO_PUBLIC_SUPABASE_ANON_KEY is still a placeholder. Use the publishable (sb_publishable_…) or anon public key from Supabase → Project Settings → API.';
  }
  return null;
}

const envError = validateEnv();

if (__DEV__ && envError) {
  console.error(`[Olives Forum] ${envError}`);
}

export const env = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  PAYSTACK_PUBLIC_KEY,
  API_BASE_URL,
  API_PORT,
  LANDING_URL,
  isPaystackConfigured: Boolean(PAYSTACK_PUBLIC_KEY),
  isConfigured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY) && !envError,
  configError: envError,
} as const;
