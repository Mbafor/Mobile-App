import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { createAnonClient, createPartnerClient } from '@/lib/supabase-server';

export const ACCESS_TOKEN_COOKIE = 'partner_access_token';
export const REFRESH_TOKEN_COOKIE = 'partner_refresh_token';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
};

export interface Partner {
  id: string;
  org_name: string;
  slug: string;
  logo_url: string | null;
  contact_email: string;
  ref_code: string;
  is_active: boolean;
}

export interface PartnerSession {
  partner: Partner;
  accessToken: string;
}

/** Writes session cookies. Only callable from a Server Action or Route Handler. */
export async function writeSessionCookies(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set(ACCESS_TOKEN_COOKIE, accessToken, { ...COOKIE_OPTIONS, maxAge: 60 * 60 });
  store.set(REFRESH_TOKEN_COOKIE, refreshToken, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 30 });
}

/** Clears session cookies. Only callable from a Server Action or Route Handler. */
export async function clearSessionCookies() {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}

async function loadActivePartner(token: string): Promise<Partner | null> {
  const { data: partner, error } = await createPartnerClient(token)
    .from('partners')
    .select('id, org_name, slug, logo_url, contact_email, ref_code, is_active')
    .eq('is_active', true)
    .maybeSingle();

  if (error || !partner) return null;
  return partner;
}

/**
 * Reads and validates the partner session. If the access token has expired,
 * attempts a one-off in-memory refresh (via the refresh token cookie) so the
 * current request still succeeds; the refreshed cookie is only persisted if
 * the caller is a Server Action/Route Handler (see requirePartnerSession callers).
 *
 * Cached per-request via React's `cache()` -- the layout and every page call
 * this independently, and without caching each one re-pays the full
 * validation chain. `cache()` dedupes calls with identical arguments (none
 * here) within a single render pass, so the chain runs once per request.
 *
 * Does NOT call `auth.getUser()` to pre-validate the access token -- that
 * was a redundant network round trip, since the `partners` select below is
 * itself RLS-scoped to `auth.uid()` and Supabase/PostgREST already verifies
 * the JWT server-side while processing that query. An invalid/expired token
 * simply makes the select return no row, which falls through to the
 * refresh-token path below. This cuts the common case (valid token) from 2
 * sequential Supabase round trips down to 1.
 */
export const getPartnerSession = cache(async (): Promise<PartnerSession | null> => {
  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!accessToken && !refreshToken) return null;

  if (accessToken) {
    const partner = await loadActivePartner(accessToken);
    if (partner) return { partner, accessToken };
  }

  if (refreshToken) {
    const { data, error } = await createAnonClient().auth.refreshSession({ refresh_token: refreshToken });
    if (!error && data.session) {
      const token = data.session.access_token;
      const partner = await loadActivePartner(token);
      if (partner) return { partner, accessToken: token };
    }
  }

  return null;
});

/** Redirects to /partner/login if there is no valid partner session. */
export async function requirePartnerSession(): Promise<PartnerSession> {
  const session = await getPartnerSession();
  if (!session) redirect('/partner/login');
  return session;
}
