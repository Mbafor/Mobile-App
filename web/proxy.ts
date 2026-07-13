import { NextResponse, type NextRequest } from 'next/server';

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/partner-session';

// Optimistic check only -- presence of a session cookie, not validity. Real
// validation happens per-request in requirePartnerSession() (see
// web/lib/partner-session.ts), matching the Next.js docs' own guidance that
// Proxy "should not be used as a full session management or authorization
// solution."
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/partner/dashboard')) {
    const hasSession =
      request.cookies.has(ACCESS_TOKEN_COOKIE) || request.cookies.has(REFRESH_TOKEN_COOKIE);
    if (!hasSession) {
      return NextResponse.redirect(new URL('/partner/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/partner/dashboard/:path*'],
};
