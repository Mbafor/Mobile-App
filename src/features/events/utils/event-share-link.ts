import * as Linking from 'expo-linking';

import { env } from '@/config/env';

/**
 * Returns the base URL of the running web app (e.g. https://your-app.vercel.app),
 * or falls back to the configured landing URL on native where window is unavailable.
 *
 * Mirrors opportunity-share-link.ts's getWebBase so share links always point to
 * whatever domain the app is actually deployed at, avoiding 404s from the marketing site.
 */
function getWebBase(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return (process.env.EXPO_PUBLIC_LANDING_URL ?? env.LANDING_URL).replace(/\/$/, '');
}

/** Deep link that opens the event in the app (requires install + sign-in). */
export function buildEventAppLink(eventId: string): string {
  return Linking.createURL(`/event/${eventId}`);
}

/** Public web URL for share sheets — points to the deployed app, not the marketing site. */
export function buildEventWebLink(eventId: string): string {
  return `${getWebBase()}/event/${eventId}`;
}
