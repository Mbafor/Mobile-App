import { NextResponse } from 'next/server';

import { getNextEvent } from '@/lib/get-next-event';

/** Backs the site-wide EventsBanner, which is a Client Component so it can
 * render from both Server Component pages and the fully-client mentor page
 * (app/mentor/mentor.tsx) -- a route handler lets it fetch the same way
 * either way, rather than Header needing to be async (which breaks when
 * imported into a "use client" tree). */
export async function GET() {
  const event = await getNextEvent();
  return NextResponse.json({ event });
}
