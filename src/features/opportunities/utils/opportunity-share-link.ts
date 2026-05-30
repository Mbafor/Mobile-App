import * as Linking from 'expo-linking';

import { env } from '@/config/env';

const WEB_BASE = (process.env.EXPO_PUBLIC_APP_WEB_URL ?? env.LANDING_URL).replace(/\/$/, '');

/** Deep link that opens the opportunity in the app (requires install + sign-in). */
export function buildOpportunityAppLink(opportunityId: string): string {
  return Linking.createURL(`/opportunity/${opportunityId}`);
}

/** Public web URL for share sheets — drives sign-up, not the listing image CDN. */
export function buildOpportunityWebLink(opportunityId: string): string {
  return `${WEB_BASE}/opportunity/${opportunityId}`;
}

export function buildOpportunityShareLinks(opportunityId: string) {
  return {
    appLink: buildOpportunityAppLink(opportunityId),
    webLink: buildOpportunityWebLink(opportunityId),
  };
}
