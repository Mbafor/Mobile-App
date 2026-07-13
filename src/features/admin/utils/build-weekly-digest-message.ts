import { env } from '@/config/env';

/**
 * Port of web/lib/digest-template.ts -- duplicated rather than shared since
 * the Expo app and web/ are separate TS programs with no shared package
 * (same precedent as share-opportunity.ts vs partner-share-template.ts).
 */

export interface DigestOpportunity {
  id: string;
  title: string;
  organization: string;
  description: string | null;
  category: string | null;
  deadline: string | null;
}

const CATEGORY_EMOJI: Record<string, string> = {
  scholarship: '🎓',
  internship: '💼',
  fellowship: '🌟',
  mentorship: '🤝',
  grant: '💰',
  competition: '🏆',
  job: '💼',
  volunteer: '🙋',
  conference: '🎤',
};

const KEYCAP_DIGITS: Record<string, string> = {
  '0': '0️⃣',
  '1': '1️⃣',
  '2': '2️⃣',
  '3': '3️⃣',
  '4': '4️⃣',
  '5': '5️⃣',
  '6': '6️⃣',
  '7': '7️⃣',
  '8': '8️⃣',
  '9': '9️⃣',
};

function keycapNumber(n: number): string {
  return String(n)
    .split('')
    .map((digit) => KEYCAP_DIGITS[digit] ?? digit)
    .join('');
}

function firstNWords(text: string, n: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, n).join(' ') + (words.length > n ? '…' : '');
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

export function formatWeekDateRange(date: Date = new Date()): string {
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(monday)} - ${fmt(sunday)}, ${sunday.getFullYear()}`;
}

export function buildWeeklyDigestMessage(opportunities: DigestOpportunity[]): string {
  const appLink = getSiteUrl();
  const lines: string[] = [];

  lines.push(`🎓 *VOILA WEEKLY OPPORTUNITIES* | ${formatWeekDateRange()}`);
  lines.push('');

  opportunities.forEach((opp, index) => {
    const emoji = (opp.category && CATEGORY_EMOJI[opp.category.toLowerCase()]) || '📌';
    const description = opp.description ? firstNWords(opp.description, 20) : opp.organization;

    lines.push(`${keycapNumber(index + 1)} *${opp.title}*`);
    lines.push(`${emoji} ${description}`);
    lines.push(`⏳ Deadline: ${formatDeadline(opp.deadline)}`);
    lines.push(`👉 ${buildBridgeLinkPlain(opp.id)}`);
    lines.push('');
  });

  lines.push(`📲 More opportunities in the app: ${appLink}`);
  lines.push('Forward to a friend who needs this 🙌');

  return lines.join('\n');
}

export function buildDigestSlug(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
