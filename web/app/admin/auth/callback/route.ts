import { NextRequest, NextResponse } from 'next/server';

import { createOAuthClient, createUserClient } from '@/lib/supabase-server';
import { writeAdminSessionCookies } from '@/lib/admin-session';

/** Google OAuth lands here after Supabase's own callback finishes (see
 * adminLoginWithGoogle in ../../login/actions.ts). Exchanges the auth code
 * for a session, rejects anyone whose profile isn't is_admin/is_super_admin
 * (same check as the email/password path), and writes the same admin
 * session cookies either way -- from here on the two login paths are
 * indistinguishable. Must use createOAuthClient (not createAnonClient) so
 * exchangeCodeForSession can read back the PKCE code_verifier cookie that
 * adminLoginWithGoogle stored when it started this flow. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/admin/login?error=oauth_failed', request.url));
  }

  const anon = await createOAuthClient();
  const { data, error } = await anon.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(new URL('/admin/login?error=oauth_failed', request.url));
  }

  const { data: profile } = await createUserClient(data.session.access_token)
    .from('profiles')
    .select('is_admin, is_super_admin')
    .eq('id', data.session.user.id)
    .maybeSingle();

  if (!profile?.is_admin && !profile?.is_super_admin) {
    return NextResponse.redirect(new URL('/admin/login?error=not_admin', request.url));
  }

  await writeAdminSessionCookies(data.session.access_token, data.session.refresh_token);

  return NextResponse.redirect(new URL('/admin', request.url));
}
