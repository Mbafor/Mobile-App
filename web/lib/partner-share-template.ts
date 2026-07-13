/**
 * Mirrors the style of the mobile app's buildWeeklyDigestMessage()
 * (src/features/admin/utils/build-weekly-digest-message.ts) -- numbered plain-text
 * list, bolded title only, footer link -- but duplicated rather than imported since
 * web/ and the Expo app are separate TS programs with no shared package, and this
 * version needs partner co-branding the mobile template doesn't.
 */

export interface ShareableOpportunity {
  id: string;
  title: string;
  organization: string;
  deadline: string | null;
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://voila-africa.com').replace(/\/$/, '');
}

export function buildBridgeLink(opportunityId: string, refCode: string): string {
  return `${getSiteUrl()}/o/${opportunityId}?ref=${refCode}`;
}

export function buildPartnerPageLink(partnerSlug: string): string {
  return `${getSiteUrl()}/partner/${partnerSlug}`;
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'Rolling / no fixed deadline';
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return 'Rolling / no fixed deadline';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function buildPartnerShareMessage(
  orgName: string,
  refCode: string,
  partnerSlug: string,
  opportunities: ShareableOpportunity[],
): string {
  const lines: string[] = [];

  lines.push(`📋 Opportunities shared by ${orgName}`);
  lines.push('In partnership with Voila Africa');
  lines.push('');

  opportunities.forEach((opp, index) => {
    lines.push(`${index + 1}. *${opp.title}*`);
    lines.push(`${opp.organization} · Deadline: ${formatDeadline(opp.deadline)}`);
    lines.push(buildBridgeLink(opp.id, refCode));
    lines.push('');
  });

  lines.push(`More opportunities: ${buildPartnerPageLink(partnerSlug)}`);

  return lines.join('\n');
}
