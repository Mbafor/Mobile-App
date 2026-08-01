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

/** The deployed app (not the marketing site) — "find more opportunities" links
 * should send people into the actual app experience, not the landing page. */
export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://app.voila-africa.com').replace(/\/$/, '');
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

  lines.push(`Opportunities shared by ${orgName}`);
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

/**
 * Single-opportunity share message for partners -- mirrors the app's own
 * individual-opportunity share format (src/features/opportunities/utils/share-opportunity.ts
 * buildShareMessage) field-for-field, with no partner branding (no org header,
 * no "In partnership" line, no numbered list). The ref code stays embedded in
 * the fallback apply link (when the opportunity has no external apply_url) so
 * click attribution keeps working -- that's a URL param, not visible branding.
 */
export interface SingleShareOpportunity {
  id: string;
  title: string;
  organization: string;
  description: string | null;
  benefits: string | null;
  category: string | null;
  country: string | null;
  locationType: string | null;
  fundingType: string | null;
  applyUrl: string | null;
  tags: string[];
  deadline: string | null;
}

const LOCATION_LABEL: Record<string, string> = {
  remote: 'Remote',
  onsite: 'On-site',
  hybrid: 'Hybrid',
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function firstParagraph(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const [paragraph] = trimmed.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return paragraph ?? trimmed;
}

export function buildPartnerOpportunityMessage(opportunity: SingleShareOpportunity, refCode: string): string {
  const lines: string[] = [];

  lines.push(`*${opportunity.title}*`);
  lines.push('');

  lines.push(`*Organisation:* ${opportunity.organization}`);
  lines.push(`*Deadline:* ${formatDeadline(opportunity.deadline)}`);

  if (opportunity.country) {
    const locationPart = opportunity.locationType
      ? `${opportunity.country} · ${LOCATION_LABEL[opportunity.locationType] ?? opportunity.locationType}`
      : opportunity.country;
    lines.push(`*Location:* ${locationPart}`);
  } else if (opportunity.locationType) {
    lines.push(`*Location:* ${LOCATION_LABEL[opportunity.locationType] ?? opportunity.locationType}`);
  }

  if (opportunity.fundingType) {
    lines.push(`*Funding:* ${capitalize(opportunity.fundingType)}`);
  }

  if (opportunity.category) {
    lines.push(`*Category:* ${capitalize(opportunity.category)}`);
  }

  const about = opportunity.description?.trim() ? firstParagraph(opportunity.description) : '';
  if (about) {
    lines.push('');
    lines.push('*About*');
    lines.push(about);
  }

  const benefits = opportunity.benefits?.trim();
  if (benefits) {
    lines.push('');
    lines.push('*Benefits*');
    lines.push(benefits);
  }

  const applyLink = opportunity.applyUrl?.trim() || buildBridgeLink(opportunity.id, refCode);
  lines.push('');
  lines.push('*Apply directly:*');
  lines.push(applyLink);
  lines.push('');
  lines.push('*Find more opportunities:*');
  lines.push(getAppUrl());
  lines.push('');
  lines.push('_Shared via Voila Africa — Discover opportunities made for you_');

  if (opportunity.tags.length > 0) {
    lines.push('');
    lines.push(opportunity.tags.slice(0, 5).map((t) => `#${t.replace(/\s+/g, '')}`).join('  '));
  }

  return lines.join('\n');
}
