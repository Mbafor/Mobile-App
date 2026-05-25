import * as Linking from 'expo-linking';

const WEB_BASE = (process.env.EXPO_PUBLIC_APP_WEB_URL ?? 'https://olivesforum.com').replace(
  /\/$/,
  '',
);

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
