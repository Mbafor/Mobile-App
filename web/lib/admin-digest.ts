/** Ported from src/features/admin/utils/build-weekly-digest-message.ts (mobile app) --
 * same numbered-list format with a direct-apply-link fallback to the bridge page,
 * duplicated rather than imported since web/ and the Expo app are separate TS
 * programs with no shared package. */

import { getSiteUrl } from './partner-share-template';

export interface DigestOpportunity {
  id: string;
  title: string;
  organization: string;
  description: string | null;
  category: string | null;
  applyUrl: string | null;
  deadline: string | null;
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'Rolling / no fixed deadline';
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return 'Rolling / no fixed deadline';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
    const applyLink = opp.applyUrl?.trim() || buildBridgeLinkPlain(opp.id);
    lines.push(`${index + 1}. *${opp.title}*`);
    lines.push(`${opp.organization} · Deadline: ${formatDeadline(opp.deadline)}`);
    lines.push(`Apply: ${applyLink}`);
    lines.push('');
  });

  lines.push(`More opportunities: ${appLink}`);

  return lines.join('\n');
}

export function buildDigestSlug(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
