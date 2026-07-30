import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { createAnonClient, createUserClient } from '@/lib/supabase-server';

export const ACCESS_TOKEN_COOKIE = 'admin_access_token';
export const REFRESH_TOKEN_COOKIE = 'admin_refresh_token';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
};

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  is_super_admin: boolean;
}

export interface AdminSession {
  admin: AdminUser;
  accessToken: string;
}

/** Writes session cookies. Only callable from a Server Action or Route Handler. */
export async function writeAdminSessionCookies(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set(ACCESS_TOKEN_COOKIE, accessToken, { ...COOKIE_OPTIONS, maxAge: 60 * 60 });
  store.set(REFRESH_TOKEN_COOKIE, refreshToken, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 30 });
}

/** Clears session cookies. Only callable from a Server Action or Route Handler. */
export async function clearAdminSessionCookies() {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}

/** Pulls the `sub` claim (auth.users.id) out of a Supabase access token
 * without a network round trip. Not signature-verified -- that's fine here,
 * since it's only used to narrow the profiles query below to one row; RLS
 * (scoped to the real, PostgREST-verified auth.uid()) still fully governs
 * what that query is allowed to return. Worst case a bad decode returns no
 * row, same as any other invalid-token failure mode. */
function decodeUserId(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    return typeof decoded.sub === 'string' ? decoded.sub : null;
  } catch {
    return null;
  }
}

/** Loads the signed-in user's own profile (RLS: "Users can read own profile",
 * 001_profiles_and_preferences.sql) and rejects anyone without is_admin or
 * is_super_admin set -- this is the same admin/super-admin distinction the
 * mobile app and current_user_can_manage_events() already use, just gated
 * here at the web session layer instead of a fresh admin-only account type.
 *
 * Filters explicitly by id instead of relying on RLS alone to narrow to one
 * row: profiles carries other, broader select policies for unrelated
 * features ("Students browse approved coach profiles",
 * 031_mentorship_browse_coaches.sql; "Super admins read all profiles",
 * 015_super_admin_notifications.sql) that make an unfiltered select return
 * every row those policies additionally expose, not just this user's own.
 * .maybeSingle() then throws PGRST116 ("multiple rows"), which was silently
 * swallowed here (only `data` was read) and misread as "not an admin". */
async function loadActiveAdmin(token: string): Promise<AdminUser | null> {
  const userId = decodeUserId(token);
  if (!userId) return null;

  const { data: profile, error } = await createUserClient(token)
    .from('profiles')
    .select('id, full_name, email, is_admin, is_super_admin')
    .eq('id', userId)
    .maybeSingle();

  if (error || !profile) return null;
  if (!profile.is_admin && !profile.is_super_admin) return null;

  return {
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    is_super_admin: Boolean(profile.is_super_admin),
  };
}

/** Reads and validates the admin session, refreshing the access token once
 * from the refresh-token cookie if needed. Mirrors getPartnerSession
 * (lib/partner-session.ts) exactly -- see that file for why this skips a
 * separate auth.getUser() call. */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!accessToken && !refreshToken) return null;

  if (accessToken) {
    const admin = await loadActiveAdmin(accessToken);
    if (admin) return { admin, accessToken };
  }

  if (refreshToken) {
    const { data, error } = await createAnonClient().auth.refreshSession({ refresh_token: refreshToken });
    if (!error && data.session) {
      const token = data.session.access_token;
      const admin = await loadActiveAdmin(token);
      if (admin) return { admin, accessToken: token };
    }
  }

  return null;
});

/** Redirects to /admin/login if there is no valid admin session. */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  return session;
}
