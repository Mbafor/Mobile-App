import axios, { AxiosError } from 'axios';
import { config } from '../config';
import { randomDelay, toAbsoluteUrl, firstSentences } from '../utils';
import type { RawOpportunity, ScraperResult, CheckDuplicateFn } from '../types';

/**
 * Idealist Open Network API
 * Docs: https://www.idealist.org/en/careers-advice/apply-to-jobs/api
 * Register for an API key at: https://www.idealist.org/en/api
 *
 * NOTE: Verify the exact endpoint and parameter names against current Idealist
 * developer documentation — their API has versioned several times.
 */
const API_BASE = 'https://www.idealist.org/api/v1/listings';
const SOURCE = 'Idealist API';
const MAX_PER_SOURCE = 100;
const PER_PAGE = 25;

interface IdealistListing {
  id?: string;
  name?: string;
  title?: string;
  org?: { name?: string };
  organizationName?: string;
  description?: string;
  applicationDeadline?: string;
  deadline?: string;
  url?: string;
  listingUrl?: string;
  imageUrl?: string;
  logoUrl?: string;
  type?: string;
  location?: { country?: string };
  country?: string;
  remote?: boolean;
  salary?: string;
  funding?: string;
}

interface IdealistResponse {
  results?: IdealistListing[];
  listings?: IdealistListing[];
  data?: IdealistListing[];
  count?: number;
  total?: number;
  nextPage?: string | null;
}

function mapListing(item: IdealistListing): RawOpportunity | null {
  const title = item.name ?? item.title ?? '';
  if (!title) return null;

  const applyUrl = item.url ?? item.listingUrl ?? '';
  if (!applyUrl) return null;

  const absUrl = toAbsoluteUrl(applyUrl, 'https://www.idealist.org');
  if (!absUrl) return null;

  const rawDesc = item.description ?? '';
  const description = firstSentences(rawDesc.replace(/<[^>]+>/g, ' '), 3);

  const deadline = (() => {
    const raw = item.applicationDeadline ?? item.deadline ?? '';
    if (!raw) return '';
    const match = raw.match(/(\d{4}-\d{2}-\d{2})/);
    return match?.[1] ?? '';
  })();

  const organization =
    item.org?.name ??
    item.organizationName ??
    '';

  const imageUrl = toAbsoluteUrl(item.imageUrl ?? item.logoUrl ?? '', 'https://www.idealist.org');

  return {
    title,
    organization,
    description,
    deadline,
    applyUrl: absUrl,
    imageUrl,
    source: SOURCE,
  };
}

export async function scrape(checkDuplicate: CheckDuplicateFn): Promise<ScraperResult> {
  const stats = { scraped: 0, newCount: 0, skipped: 0, pagesVisited: 0 };
  const opportunities: RawOpportunity[] = [];

  if (!config.idealistApiKey) {
    console.log(`[${SOURCE}] IDEALIST_API_KEY not set — skipping source`);
    return { ...stats, opportunities };
  }

  const listingTypes = ['INTERNSHIP', 'JOB', 'VOL_OPP', 'ACTION'];
  let page = 1;

  while (stats.newCount < MAX_PER_SOURCE) {
    let response: IdealistResponse;
    try {
      const res = await axios.get<IdealistResponse>(API_BASE, {
        params: {
          type: listingTypes.join(','),
          sort: '-created',
          per_page: PER_PAGE,
          page,
          api_key: config.idealistApiKey,
        },
        headers: {
          'User-Agent': 'Voila-Bot/1.0 (voila-africa.com)',
          Accept: 'application/json',
        },
        timeout: 15000,
      });
      response = res.data;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response) {
        const status = axiosErr.response.status;
        if (status === 429 || status === 403) {
          console.error(`[${SOURCE}] HTTP ${status} — stopping source`);
          break;
        }
        if (status === 401) {
          console.error(`[${SOURCE}] Invalid API key (401) — stopping source`);
          break;
        }
      }
      console.error(`[${SOURCE}] API request failed: ${String(err)}`);
      break;
    }

    stats.pagesVisited++;

    const listings: IdealistListing[] =
      response.results ?? response.listings ?? response.data ?? [];

    if (listings.length === 0) break;

    for (const item of listings) {
      if (stats.newCount >= MAX_PER_SOURCE) break;
      stats.scraped++;

      const raw = mapListing(item);
      if (!raw) {
        console.warn(`[${SOURCE}] Skipping listing with missing title/url`);
        continue;
      }

      try {
        const isDup = await checkDuplicate(raw.applyUrl);
        if (isDup) {
          stats.skipped++;
          continue;
        }

        opportunities.push(raw);
        stats.newCount++;
      } catch (err) {
        console.warn(`[${SOURCE}] Duplicate check failed for ${raw.applyUrl}: ${String(err)}`);
      }
    }

    // Stop if no next page indicator
    if (response.nextPage === null || response.nextPage === undefined || listings.length < PER_PAGE) break;

    page++;
    await randomDelay();
  }

  return { ...stats, opportunities };
}
