import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';

export const USER_AGENT = 'Voila-Bot/1.0 (voila-africa.com)';
const MIN_DELAY_MS = 2000;
const MAX_DELAY_MS = 3000;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomDelay(): Promise<void> {
  const ms = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  return sleep(ms);
}

export async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await axios.get<string>(url, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 15000,
    });
    return res.data;
  } catch (err) {
    const axiosErr = err as AxiosError;
    if (axiosErr.response) {
      const status = axiosErr.response.status;
      if (status === 429 || status === 403) {
        throw new RateLimitError(`HTTP ${status} from ${url}`);
      }
      console.warn(`[warn] HTTP ${status} for ${url} — skipping`);
    } else {
      console.warn(`[warn] Request failed for ${url}: ${String(err)}`);
    }
    return null;
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export async function checkRobots(siteUrl: string): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const robotsParser = require('robots-parser') as (
      url: string,
      content: string
    ) => { isAllowed: (url: string, ua: string) => boolean | undefined };

    const robotsUrl = new URL('/robots.txt', siteUrl).href;
    const res = await axios.get<string>(robotsUrl, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 8000,
    });
    const robots = robotsParser(robotsUrl, res.data);
    const allowed = robots.isAllowed(siteUrl, USER_AGENT);
    return allowed !== false;
  } catch {
    return true;
  }
}

export function toAbsoluteUrl(url: string, base: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  try {
    return new URL(url, base).href;
  } catch {
    return '';
  }
}

export function stripHtml(html: string): string {
  const $ = cheerio.load(html);
  return $.text().replace(/\s+/g, ' ').trim();
}

const MONTH_MAP: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04',
  jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

export function parseDate(text: string): string {
  if (!text) return '';

  // YYYY-MM-DD
  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso?.[1] && iso[2] && iso[3]) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // "January 15, 2025" or "January 15 2025"
  const long = text.match(/([A-Za-z]+)\s+(\d{1,2})[,\s]+(\d{4})/);
  if (long?.[1] && long[2] && long[3]) {
    const month = MONTH_MAP[long[1].toLowerCase()];
    if (month) return `${long[3]}-${month}-${long[2].padStart(2, '0')}`;
  }

  // "15 January 2025"
  const reverse = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (reverse?.[1] && reverse[2] && reverse[3]) {
    const month = MONTH_MAP[reverse[2].toLowerCase()];
    if (month) return `${reverse[3]}-${month}-${reverse[1].padStart(2, '0')}`;
  }

  // DD/MM/YYYY
  const slash = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slash?.[1] && slash[2] && slash[3]) {
    return `${slash[3]}-${slash[2].padStart(2, '0')}-${slash[1].padStart(2, '0')}`;
  }

  return '';
}

export function extractDeadline(text: string): string {
  const patterns = [
    /(?:deadline|closing date|apply by|due date|submission deadline|applications close)[:\s]+([^.\n]{5,40})/i,
    /(?:deadline|closing)[:\s]+([A-Za-z]+ \d{1,2},?\s+\d{4})/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const parsed = parseDate(match[1]);
      if (parsed) return parsed;
    }
  }
  return '';
}

export function extractApplyUrl($: cheerio.CheerioAPI, base: string): string {
  const applySelectors = [
    'a[href*="apply"]',
    'a[href*="application"]',
    'a:contains("Apply Now")',
    'a:contains("Apply Here")',
    'a:contains("Apply")',
    'a:contains("Click Here to Apply")',
    'a:contains("Submit Application")',
  ];
  for (const sel of applySelectors) {
    const href = $(sel).first().attr('href');
    if (href) {
      const abs = toAbsoluteUrl(href, base);
      if (abs) return abs;
    }
  }
  return '';
}

export function extractOrganization(text: string): string {
  const patterns = [
    /(?:offered by|organization[:\s]|hosted by|host[:\s]|organizer[:\s]|by[:\s])([A-Z][^\n.]{3,60})/i,
    /(?:^|\n)([A-Z][A-Za-z\s&.,'-]{5,50})(?:\s+(?:is|are|has|invites|offers))/m,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return '';
}

export function firstSentences(text: string, count = 3): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  const sentences = clean.match(/[^.!?]+[.!?]+/g) ?? [];
  return sentences.slice(0, count).join(' ').trim() || clean.slice(0, 300);
}
