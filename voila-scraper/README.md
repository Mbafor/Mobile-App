# Voila Scraper

Automated opportunity scraper for [Voila Africa](https://voila-africa.com). Scrapes youth opportunities from 4 approved sources, classifies them, and saves them to Supabase with `status = "pending"` for admin review. Runs daily at midnight UTC.

## Sources

| Source | Method |
|--------|--------|
| Idealist.org | REST API (requires API key) |
| Opportunities for Africans | Web scraping |
| After School Africa | Web scraping |
| Scholars4Dev | Web scraping |

---

## Setup

### 1. Run the Supabase migration

Open your Supabase project → SQL Editor → paste and run `migration.sql`.

This creates the `opportunities` table, indexes, and admin RPC functions.

### 2. Install dependencies

```bash
cd voila-scraper
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here   # NOT the anon key — must bypass RLS
IDEALIST_API_KEY=your-idealist-api-key-here
PORT=3000
```

> **Important:** Use the `service_role` key from Supabase → Settings → API. The anon key will be rejected by RLS.

### 4. Get an Idealist API key

Register at [https://www.idealist.org/en/api](https://www.idealist.org/en/api) and request Open Network API access. If you don't have a key yet, the Idealist scraper is skipped automatically (the other 3 sources still run).

---

## Running

### Manual run (for testing)

```bash
npm run scrape:now
```

Runs a full scrape immediately without waiting for midnight. Use this to test each scraper.

### Production (daily cron)

```bash
npm start
```

Starts the long-running process with the midnight UTC cron job and health endpoint at `GET /health`.

---

## Health endpoint

While running, check status at:

```
GET http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "lastRun": "2025-01-15T00:01:23.456Z",
  "nextRun": "2025-01-16T00:00:00.000Z",
  "lastRunSummary": { "new": 87, "skipped": 213, "errors": 0 }
}
```

Railway and Render use this URL for health checks.

---

## Deploy to Railway or Render

### Railway

1. Create a new Railway project → connect this repo (or push `voila-scraper/` as its own repo)
2. Set **Start Command**: `npm start`
3. Add environment variables in the Railway dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `IDEALIST_API_KEY`
   - `PORT` (Railway injects this automatically, but you can set it too)
4. Add a health check path: `/health`

### Render

1. Create a new **Web Service** → connect repo
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. Add environment variables in Render dashboard (same as above)
5. Health Check Path: `/health`

---

## Admin review flow

Scraped opportunities land in Supabase with:
- `status = "pending"`
- `is_active = false`

They are invisible to the Voila app until an admin approves them.

**Approve** via Supabase RPC:
```sql
select approve_opportunity('<opportunity_uuid>', '<admin_user_id>', 'Looks good');
```

**Reject** via Supabase RPC:
```sql
select reject_opportunity('<opportunity_uuid>', '<admin_user_id>', 'Not relevant for Africa');
```

Or use the Voila admin dashboard in the mobile app — it queries `status = "pending"` opportunities and provides an approval/rejection UI.

---

## Project structure

```
voila-scraper/
  src/
    scrapers/
      idealist.ts               # Idealist API integration
      opportunitiesforafricans.ts
      afterschoolafrica.ts
      scholars4dev.ts
    types.ts                    # Shared TypeScript types
    config.ts                   # Env var loading
    utils.ts                    # HTTP, HTML parsing, date parsing helpers
    classifier.ts               # Keyword classification for all fields
    db.ts                       # Supabase upsert, duplicate check, expire RPC
    health.ts                   # Express health endpoint
    index.ts                    # Orchestrator — runs all scrapers, classifies, saves
    cron.ts                     # node-cron scheduler (entry point)
  migration.sql                 # Run in Supabase SQL Editor first
  .env.example
  package.json
  tsconfig.json
  README.md
```

---

## Adjusting web scrapers

The web scrapers (`opportunitiesforafricans.ts`, `afterschoolafrica.ts`, `scholars4dev.ts`) use CSS selectors based on common WordPress patterns. If a site updates its HTML structure, you'll see warnings like:

```
[warn] HTTP 200 but no listings found at https://... — structure may have changed
```

To fix: inspect the site's HTML in your browser DevTools and update the CSS selectors in `extractListingUrls()` for that scraper. The scraper will never crash — it logs and continues.

---

## Adjusting the Idealist API

The `idealist.ts` scraper uses `https://www.idealist.org/api/v1/listings`. If Idealist updates their API:
1. Check their current developer docs at [https://www.idealist.org/en/api](https://www.idealist.org/en/api)
2. Update `API_BASE`, query params, and the `IdealistListing` interface in `src/scrapers/idealist.ts`
3. The response shape mapping is in `mapListing()` — update field names there
