import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requireUrl(): string {
  if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL configuration on server.');
  return SUPABASE_URL;
}

/** Anon-key client for unauthenticated operations like signInWithPassword. */
export function createAnonClient() {
  if (!SUPABASE_ANON_KEY) throw new Error('Missing SUPABASE_ANON_KEY configuration on server.');
  return createClient(requireUrl(), SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Service-role client for public pages (bridge page, public partner page) with no logged-in user context. */
export function createServiceRoleClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY configuration on server.');
  }
  return createClient(requireUrl(), SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Anon-key client carrying a logged-in user's own access token, so RLS (auth.uid()) applies. */
export function createUserClient(accessToken: string) {
  if (!SUPABASE_ANON_KEY) throw new Error('Missing SUPABASE_ANON_KEY configuration on server.');
  return createClient(requireUrl(), SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

/** Alias of createUserClient, used by partner-facing code for readability. */
export const createPartnerClient = createUserClient;
