import express, { Request, Response } from 'express';
import { config } from './config';
import type { RunResult } from './index';

const app = express();

interface HealthState {
  lastRun: string | null;
  nextRun: string;
  lastRunSummary: { new: number; skipped: number; errors: number } | null;
}

const state: HealthState = {
  lastRun: null,
  nextRun: nextMidnightUTC(),
  lastRunSummary: null,
};

function nextMidnightUTC(): string {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return next.toISOString();
}

export function updateHealth(result: RunResult): void {
  state.lastRun = result.timestamp;
  state.nextRun = nextMidnightUTC();
  state.lastRunSummary = {
    new: result.totalNew,
    skipped: result.totalSkipped,
    errors: result.errors,
  };
}

app.get('/', (_req: Request, res: Response) => {
  res.redirect('/health');
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    lastRun: state.lastRun,
    nextRun: state.nextRun,
    lastRunSummary: state.lastRunSummary,
  });
});

export function startHealthServer(): void {
  app.listen(config.port, () => {
    console.log(`[health] Server listening on port ${config.port}`);
  });
}
