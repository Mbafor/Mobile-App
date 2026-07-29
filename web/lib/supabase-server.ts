import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

/** Cookie-backed client for the OAuth (Google) sign-in flow only.
 * signInWithOAuth's PKCE code_verifier has to survive between two separate
 * requests -- the Server Action that starts the flow, and the Route Handler
 * that finishes it -- so it needs real cookie storage, unlike the other
 * clients above (createAnonClient etc.) which are deliberately stateless.
 * Must be awaited: Next's cookies() is async in this version. */
export async function createOAuthClient() {
  if (!SUPABASE_ANON_KEY) throw new Error('Missing SUPABASE_ANON_KEY configuration on server.');
  const cookieStore = await cookies();
  return createServerClient(requireUrl(), SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}
