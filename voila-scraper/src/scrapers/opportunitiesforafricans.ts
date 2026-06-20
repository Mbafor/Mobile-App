import * as cheerio from 'cheerio';
import {
  fetchPage, randomDelay, checkRobots, toAbsoluteUrl, stripHtml,
  extractDeadline, extractApplyUrl, extractOrganization, firstSentences,
  RateLimitError,
} from '../utils';
import type { RawOpportunity, ScraperResult, CheckDuplicateFn } from '../types';

const BASE_URL = 'https://www.opportunitiesforafricans.com';
const SOURCE = 'Opportunities for Africans';
const MAX_PER_SOURCE = 100;
const MAX_PAGES = 25;

function pageUrl(n: number): string {
  return n === 1 ? `${BASE_URL}/` : `${BASE_URL}/page/${n}/`;
}

function extractListingUrls(html: string): Array<{ url: string; title: string; image: string; excerpt: string }> {
  const $ = cheerio.load(html);
  const items: Array<{ url: string; title: string; image: string; excerpt: string }> = [];

  const containers = $('article, .post, .entry').toArray();
  if (containers.length === 0) return items;

  for (const el of containers) {
    const $el = $(el);

    const anchor =
      $el.find('h2.entry-title a, h1.entry-title a, .entry-title a, h2 a, h3 a').first();
    const url = toAbsoluteUrl(anchor.attr('href') ?? '', BASE_URL);
    const title = anchor.text().trim();
    if (!url || !title) continue;

    const image = toAbsoluteUrl(
      $el.find('.wp-post-image, .entry-thumbnail img, figure img, .post-thumbnail img').first().attr('src') ?? '',
      BASE_URL,
    );

    const excerpt = $el.find('.entry-summary, .entry-content p, .excerpt').first().text().trim();

    items.push({ url, title, image, excerpt });
  }
  return items;
}

function hasNextPage(html: string): boolean {
  const $ = cheerio.load(html);
  return $('a.next.page-numbers, .nav-previous a, a[rel="next"]').length > 0;
}

async function scrapeDetail(url: string): Promise<Partial<RawOpportunity>> {
  const html = await fetchPage(url);
  if (!html) return {};

  const $ = cheerio.load(html);

  const contentEl = $('.entry-content, .post-content, article .content, .single-content').first();
  const rawText = contentEl.length ? contentEl.text() : $('body').text();
  const description = firstSentences(stripHtml(contentEl.html() ?? rawText), 3);

  const deadline = extractDeadline(rawText);
  const applyUrl = extractApplyUrl($, url) || url;
  const organization = extractOrganization(rawText);

  return { description, deadline, applyUrl, organization };
}

export async function scrape(checkDuplicate: CheckDuplicateFn): Promise<ScraperResult> {
  const stats = { scraped: 0, newCount: 0, skipped: 0, pagesVisited: 0 };
  const opportunities: RawOpportunity[] = [];

  const allowed = await checkRobots(BASE_URL);
  if (!allowed) {
    console.warn(`[${SOURCE}] robots.txt disallows scraping — skipping source`);
    return { ...stats, opportunities };
  }

  for (let page = 1; page <= MAX_PAGES; page++) {
    if (stats.newCount >= MAX_PER_SOURCE) break;

    const url = pageUrl(page);
    let html: string | null;
    try {
      html = await fetchPage(url);
    } catch (err) {
      if (err instanceof RateLimitError) {
        console.error(`[${SOURCE}] Rate limited — stopping source. ${String(err)}`);
        break;
      }
      throw err;
    }

    if (!html) break;
    stats.pagesVisited++;

    const listings = extractListingUrls(html);
    if (listings.length === 0) break;

    for (const listing of listings) {
      if (stats.newCount >= MAX_PER_SOURCE) break;
      stats.scraped++;

      try {
        const isDup = await checkDuplicate(listing.url);
        if (isDup) {
          stats.skipped++;
          continue;
        }

        await randomDelay();

        let detail: Partial<RawOpportunity>;
        try {
          detail = await scrapeDetail(listing.url);
        } catch (err) {
          if (err instanceof RateLimitError) {
            console.error(`[${SOURCE}] Rate limited on detail page — stopping source`);
            return { ...stats, opportunities };
          }
          console.warn(`[${SOURCE}] Failed to scrape detail for ${listing.url}: ${String(err)}`);
          continue;
        }

        const applyUrl = detail.applyUrl ?? listing.url;

        // Second duplicate check using the actual apply URL if it differs
        if (applyUrl !== listing.url) {
          const isDupByApply = await checkDuplicate(applyUrl);
          if (isDupByApply) {
            stats.skipped++;
            continue;
          }
        }

        const opp: RawOpportunity = {
          title: listing.title,
          organization: detail.organization ?? '',
          description: detail.description ?? listing.excerpt.slice(0, 300),
          deadline: detail.deadline ?? '',
          applyUrl,
          imageUrl: listing.image,
          source: SOURCE,
        };

        opportunities.push(opp);
        stats.newCount++;
      } catch (err) {
        console.warn(`[${SOURCE}] Error processing ${listing.url}: ${String(err)}`);
      }
    }

    if (!hasNextPage(html)) break;
    await randomDelay();
  }

  return { ...stats, opportunities };
}
