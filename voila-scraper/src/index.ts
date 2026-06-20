import { checkDuplicate, saveOpportunity, expirePastOpportunities } from './db';
import { classifyBatch } from './classifier';
import type { RawOpportunity, ScraperStats } from './types';

import { scrape as scrapeOFA } from './scrapers/opportunitiesforafricans';
import { scrape as scrapeASA } from './scrapers/afterschoolafrica';
import { scrape as scrapeS4D } from './scrapers/scholars4dev';
import { scrape as scrapeIdealist } from './scrapers/idealist';
import { scrape as scrapeOD } from './scrapers/opportunitydesk';

interface SourceConfig {
  name: string;
  scrape: typeof scrapeOFA;
}

const SOURCES: SourceConfig[] = [
  { name: 'Opportunities for Africans', scrape: scrapeOFA },
  { name: 'After School Africa',        scrape: scrapeASA },
  { name: 'Scholars4Dev',               scrape: scrapeS4D },
  { name: 'Idealist API',               scrape: scrapeIdealist },
  { name: 'Opportunity Desk',           scrape: scrapeOD },
];

export interface RunResult {
  timestamp: string;
  sources: Record<string, ScraperStats>;
  totalNew: number;
  totalSkipped: number;
  errors: number;
}

export async function runScraper(): Promise<RunResult> {
  const timestamp = new Date().toISOString();
  console.log(`\n===== RUN STARTED [${timestamp}] =====`);

  try {
    console.log('[info] Expiring past opportunities...');
    await expirePastOpportunities();
  } catch (err) {
    console.error(`[warn] expire_past_opportunities failed: ${String(err)}`);
  }

  const sourceStats: Record<string, ScraperStats> = {};
  let totalNew = 0;
  let totalSkipped = 0;
  let errors = 0;

  // -----------------------------------------------------------------------
  // Phase 1: Scrape all sources
  // -----------------------------------------------------------------------
  const allRaw: RawOpportunity[] = [];

  for (const { name, scrape } of SOURCES) {
    console.log(`\n[info] Starting source: ${name}`);
    try {
      const result = await scrape(checkDuplicate);

      allRaw.push(...result.opportunities);

      const stats: ScraperStats = {
        scraped: result.scraped,
        newCount: result.newCount,
        skipped: result.skipped,
        pagesVisited: result.pagesVisited,
      };

      sourceStats[name] = stats;
      totalNew += stats.newCount;
      totalSkipped += stats.skipped;

      console.log(
        `[${name}] — Scraped: ${stats.scraped} | New: ${stats.newCount} | Skipped (duplicate): ${stats.skipped} | Pages visited: ${stats.pagesVisited}`,
      );
    } catch (err) {
      console.error(`[error] Source "${name}" failed: ${String(err)}`);
      errors++;
      sourceStats[name] = { scraped: 0, newCount: 0, skipped: 0, pagesVisited: 0 };
    }
  }

  // -----------------------------------------------------------------------
  // Phase 2: Batch classify all new opportunities in one API call
  // -----------------------------------------------------------------------
  const classified = await classifyBatch(allRaw);

  // -----------------------------------------------------------------------
  // Phase 3: Save results to Supabase
  // -----------------------------------------------------------------------
  for (const opp of classified) {
    try {
      await saveOpportunity(opp);
    } catch (err) {
      console.error(`[error] Failed to save "${opp.title}": ${String(err)}`);
      errors++;
    }
  }

  const endTimestamp = new Date().toISOString();
  const pad = (s: string): string => s.padEnd(30, ' ');

  console.log(`
===== RUN COMPLETE [${endTimestamp}] =====
${pad('Opportunities for Africans')} — New: ${sourceStats['Opportunities for Africans']?.newCount ?? 0} | Skipped: ${sourceStats['Opportunities for Africans']?.skipped ?? 0}
${pad('After School Africa')}        — New: ${sourceStats['After School Africa']?.newCount ?? 0} | Skipped: ${sourceStats['After School Africa']?.skipped ?? 0}
${pad('Scholars4Dev')}               — New: ${sourceStats['Scholars4Dev']?.newCount ?? 0} | Skipped: ${sourceStats['Scholars4Dev']?.skipped ?? 0}
${pad('Idealist API')}               — New: ${sourceStats['Idealist API']?.newCount ?? 0} | Skipped: ${sourceStats['Idealist API']?.skipped ?? 0}
${pad('Opportunity Desk')}           — New: ${sourceStats['Opportunity Desk']?.newCount ?? 0} | Skipped: ${sourceStats['Opportunity Desk']?.skipped ?? 0}
------------------------------------------
Total New: ${totalNew} | Total Skipped: ${totalSkipped} | Errors: ${errors}
All pending. Awaiting admin review.
`);

  return { timestamp: endTimestamp, sources: sourceStats, totalNew, totalSkipped, errors };
}

// Allow running directly: ts-node src/index.ts
if (require.main === module) {
  runScraper().catch((err: unknown) => {
    console.error('[fatal]', err);
    process.exit(1);
  });
}
