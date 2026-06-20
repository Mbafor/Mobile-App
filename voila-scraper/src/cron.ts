import cron from 'node-cron';
import { runScraper } from './index';
import { startHealthServer, updateHealth } from './health';

// Boot message
console.log('Voila Scraper started — running every Monday and Thursday at midnight UTC');

// Start health check server
startHealthServer();

// Schedule: Monday and Thursday at midnight UTC
cron.schedule('0 0 * * 1,4', async () => {
  console.log(`[cron] Triggered at ${new Date().toISOString()}`);
  try {
    const result = await runScraper();
    updateHealth(result);
  } catch (err) {
    // Never crash the process — next midnight run must always fire
    console.error(`[cron] Unhandled error during run: ${String(err)}`);
  }
}, {
  timezone: 'UTC',
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[cron] SIGTERM received — shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[cron] SIGINT received — shutting down gracefully');
  process.exit(0);
});
