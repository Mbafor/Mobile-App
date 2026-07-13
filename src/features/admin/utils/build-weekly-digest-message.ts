import { env } from '@/config/env';

/**
 * Port of web/lib/partner-share-template.ts's buildPartnerShareMessage -- duplicated
 * rather than shared since the Expo app and web/ are separate TS programs with no
 * shared package (same precedent as share-opportunity.ts vs partner-share-template.ts).
 */

export interface DigestOpportunity {
  id: string;
  title: string;
  organization: string;
  description: string | null;
  category: string | null;
  deadline: string | null;
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'Rolling / no fixed deadline';
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return 'Rolling / no fixed deadline';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getSiteUrl(): string {
  return env.LANDING_URL.replace(/\/$/, '');
}

export function buildBridgeLinkPlain(opportunityId: string): string {
  return `${getSiteUrl().replace(/^https?:\/\//, '')}/o/${opportunityId}`;
}

export function buildDigestPageLink(slug: string): string {
  return `${getSiteUrl()}/digest/${slug}`;
}

export function buildWeeklyDigestMessage(opportunities: DigestOpportunity[]): string {
  const appLink = getSiteUrl();
  const lines: string[] = [];

  lines.push('📋 Opportunities shared by Voila Africa');
  lines.push('');

  opportunities.forEach((opp, index) => {
    lines.push(`${index + 1}. *${opp.title}*`);
    lines.push(`${opp.organization} · Deadline: ${formatDeadline(opp.deadline)}`);
    lines.push(buildBridgeLinkPlain(opp.id));
    lines.push('');
  });

  lines.push(`More opportunities: ${appLink}`);

  return lines.join('\n');
}

export function buildDigestSlug(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
