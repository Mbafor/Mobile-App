import * as cheerio from 'cheerio';
import {
  fetchPage, randomDelay, toAbsoluteUrl, stripHtml,
  extractDeadline, extractApplyUrl, extractOrganization, firstSentences,
  RateLimitError,
} from '../utils';
import type { RawOpportunity, ScraperResult, CheckDuplicateFn } from '../types';

const BASE_URL = 'https://opportunitydesk.org';
const SOURCE = 'Opportunity Desk';
const MAX_NEW = 100;

// Most-recent sitemaps first; each holds ~650 posts ordered oldest→newest,
// so we parse newest-first by reversing after load.
const SITEMAPS = [
  `${BASE_URL}/wp-sitemap-posts-post-14.xml`,
  `${BASE_URL}/wp-sitemap-posts-post-13.xml`,
  `${BASE_URL}/wp-sitemap-posts-post-12.xml`,
];

const MAX_AGE_DAYS = 45;

// ---------------------------------------------------------------------------
// Roundup / editorial posts to skip — these are not individual opportunities
// ---------------------------------------------------------------------------

const SKIP_SLUG_PATTERNS = [
  /currently-open/i,
  /hot-job-opportunities/i,
  /\d+-scholarship/i,           // "10 Scholarship & Study Abroad…"
  /\d+-fellowships?/i,
  /\d+-grant/i,
  /young-person-of-the-month/i,
  /complete-guide-to/i,
  /how-to-/i,
  /what-is-/i,
  /best-countries/i,
  /top-\d+/i,
];

function isOpportunityPost(url: string): boolean {
  const slug = url.replace(/\/$/, '').split('/').pop() ?? '';
  return !SKIP_SLUG_PATTERNS.some((p) => p.test(slug));
}

// ---------------------------------------------------------------------------
// Sitemap parsing (uses WordPress core sitemap format: wp-sitemap-*.xml)
// ---------------------------------------------------------------------------

function parseSitemapEntries(xml: string): Array<{ url: string; lastmod: string }> {
  const $ = cheerio.load(xml, { xmlMode: true });
  const items: Array<{ url: string; lastmod: string }> = [];

  $('url').each((_, el) => {
    const url = $(el).find('loc').text().trim();
    const lastmod = $(el).find('lastmod').text().trim();
    if (url) items.push({ url, lastmod });
  });

  // Newest first
  return items.sort(
    (a, b) => new Date(b.lastmod).getTime() - new Date(a.lastmod).getTime(),
  );
}

// ---------------------------------------------------------------------------
// Detail page scraping
// ---------------------------------------------------------------------------

interface DetailResult {
  title: string;
  description: string;
  deadline: string;
  applyUrl: string;
  organization: string;
  imageUrl: string;
}

async function scrapeDetail(url: string): Promise<Partial<DetailResult>> {
  const html = await fetchPage(url);
  if (!html) return {};

  const $ = cheerio.load(html);

  // Title
  const title =
    $('h1.entry-title, h1.post-title, h1.td-page-title, h1').first().text().trim();

  // Featured image: og:image is most reliable on this site
  const ogImage = $('meta[property="og:image"]').attr('content') ?? '';
  const fallbackImage = toAbsoluteUrl(
    $('img.wp-post-image, .entry-content img, article img').first().attr('src') ?? '',
    BASE_URL,
  );
  const imageUrl = ogImage || fallbackImage;

  // Main content area
  const contentEl = $(
    '.entry-content, .td-post-content, .post-content, article .content',
  ).first();
  const rawHtml = contentEl.html() ?? '';
  const rawText = contentEl.length ? contentEl.text() : $('article').text() || $('body').text();

  // Skip posts that look like roundups (many opportunity titles listed inside)
  // A roundup has very few paragraphs but many list items / h3 titles
  const paragraphCount = contentEl.find('p').length;
  const h3Count = contentEl.find('h3, h4').length;
  if (h3Count > 6 && paragraphCount < h3Count) {
    // Likely a "10 Opportunities Currently Open" roundup — skip
    return {};
  }

  const description = firstSentences(stripHtml(rawHtml || rawText), 3);
  const deadline = extractDeadline(rawText);
  const applyUrl = extractApplyUrl($, url) || url;
  const organization = extractOrganization(rawText);

  return { title, description, deadline, applyUrl, organization, imageUrl };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function scrape(checkDuplicate: CheckDuplicateFn): Promise<ScraperResult> {
  const stats = { scraped: 0, newCount: 0, skipped: 0, pagesVisited: 0 };
  const opportunities: RawOpportunity[] = [];

  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  for (const sitemapUrl of SITEMAPS) {
    if (stats.newCount >= MAX_NEW) break;

    // Sitemaps are XML for crawlers — use browser UA so responses aren't filtered
    const xml = await fetchPage(sitemapUrl);
    if (!xml) {
      console.warn(`[${SOURCE}] Could not fetch sitemap ${sitemapUrl}`);
      continue;
    }
    stats.pagesVisited++;

    const entries = parseSitemapEntries(xml)
      .filter((e) => !e.lastmod || new Date(e.lastmod).getTime() > cutoff)
      .filter((e) => isOpportunityPost(e.url));

    console.log(
      `[${SOURCE}] Sitemap ${sitemapUrl.split('/').pop()}: ` +
      `${entries.length} opportunity entries within ${MAX_AGE_DAYS} days`,
    );

    for (const entry of entries) {
      if (stats.newCount >= MAX_NEW) break;
      stats.scraped++;

      try {
        // Primary duplicate check: by post URL
        const isDup = await checkDuplicate(entry.url);
        if (isDup) {
          stats.skipped++;
          continue;
        }

        await randomDelay();

        let detail: Partial<DetailResult>;
        try {
          detail = await scrapeDetail(entry.url);
        } catch (err) {
          if (err instanceof RateLimitError) {
            console.error(`[${SOURCE}] Rate limited on ${entry.url} — stopping source`);
            return { ...stats, opportunities };
          }
          console.warn(`[${SOURCE}] Failed to scrape ${entry.url}: ${String(err)}`);
          continue;
        }

        // Skip if detail page returned empty (roundup detection or fetch failure)
        if (!detail.title) {
          continue;
        }

        const applyUrl = detail.applyUrl ?? entry.url;

        // Secondary duplicate check: by extracted apply URL (external link)
        if (applyUrl !== entry.url) {
          const isDupByApply = await checkDuplicate(applyUrl);
          if (isDupByApply) {
            stats.skipped++;
            continue;
          }
        }

        const opp: RawOpportunity = {
          title: detail.title,
          organization: detail.organization ?? '',
          description: detail.description ?? '',
          deadline: detail.deadline ?? '',
          applyUrl,
          imageUrl: detail.imageUrl ?? '',
          source: SOURCE,
        };

        opportunities.push(opp);
        stats.newCount++;
      } catch (err) {
        console.warn(`[${SOURCE}] Error processing ${entry.url}: ${String(err)}`);
      }
    }
  }

  return { ...stats, opportunities };
}
