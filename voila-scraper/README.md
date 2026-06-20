# Voila Scraper

Automated opportunity scraper for [Voila Africa](https://voila-africa.com). Scrapes youth opportunities from 4 approved sources, classifies them, and saves them to Supabase with `status = "pending"` for admin review. Runs daily at midnight UTC.

## Sources

| Source | Method |
|--------|--------|
| Opportunities for Africans | Web scraping |
| After School Africa | Web scraping |
| Scholars4Dev | Web scraping |
| Idealist.org | REST API (skipped until you set `IDEALIST_API_KEY`) |

---

## Before you deploy — run the Supabase migration

This must be done once before the scraper can write to your database.

1. Open your Supabase project → **SQL Editor**
2. Paste the entire contents of `migration.sql` and click **Run**
3. You should see: `Success. No rows returned`

This adds the scraper columns (`apply_url`, `status`, `is_active`, `category`, etc.) to the existing `opportunities` table and creates the `approve_opportunity` / `reject_opportunity` RPCs.

---

## Deploy to Railway

### Step 1 — Push your Mobile-App repo to GitHub

Railway deploys from GitHub. Make sure your latest code is pushed:

```bash
git add .
git commit -m "add voila scraper"
git push
```

---

### Step 2 — Create a Railway project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Find and select your **Mobile-App** repository
5. Click **Deploy Now**

Railway will immediately start a build. It will **fail** at this point — that is expected because the root directory and environment variables are not configured yet.

---

### Step 3 — Point Railway at the voila-scraper folder

1. Click the service card that Railway just created
2. Go to **Settings** → scroll to **Source**
3. Under **Root Directory**, type exactly: `voila-scraper`
4. Click **Save**

Railway will rebuild from that folder. It now sees `voila-scraper/package.json` as the project root.

---

### Step 4 — Add environment variables

1. In the same service, go to the **Variables** tab
2. Click **New Variable** and add each of the following:

| Variable name | Where to find the value |
|---|---|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → **Project URL** |
| `SUPABASE_SERVICE_KEY` | Supabase Dashboard → Settings → API → **service_role** key (not the anon key) |
| `PORT` | `3000` — Railway also injects this automatically, but set it explicitly |

**Optional — add later once you have the key:**

| Variable name | Value |
|---|---|
| `IDEALIST_API_KEY` | Your Idealist Open Network API key — scraper skips Idealist until this is set |

> Always use the **service_role** key, not the anon key. The anon key is blocked by RLS and the scraper cannot write to the database.

After adding the variables, Railway triggers a new deployment automatically.

---

### Step 5 — Verify the build succeeded

1. Click the **Deployments** tab
2. Wait for the build to finish — usually under 2 minutes
3. Click the deployment row to open the build log
4. The last lines should look like this:

```
> voila-scraper@1.0.0 build
> tsc

> voila-scraper@1.0.0 start
> node dist/cron.js

[cron] Voila scraper started — next run at midnight UTC
[health] Health server listening on port 3000
```

If you see a red **Failed** badge, click it and read the error — it is almost always a missing or wrong environment variable.

---

### Step 6 — Set the health check

1. Go to **Settings** → scroll to **Health Check**
2. Set **Path** to `/health`
3. Set **Timeout** to `30` seconds
4. Click **Save**

Railway now pings `/health` every few minutes. If the scraper crashes, Railway restarts it automatically.

---

### Step 7 — Generate a public URL and confirm it is running

1. Go to **Settings** → **Networking** → click **Generate Domain**
2. Railway gives you a URL like `https://voila-scraper-production.up.railway.app`
3. Open it in your browser — you should see:

```json
{
  "status": "ok",
  "lastRun": null,
  "nextRun": "2025-01-16T00:00:00.000Z",
  "lastRunSummary": null
}
```

`lastRun` is `null` until the first midnight UTC run completes. The scraper is live.

---

### Step 8 — Trigger a manual scrape to confirm the database connection

You do not need to wait until midnight to test. Run a one-shot scrape locally against the live database:

```bash
cd voila-scraper
cp .env.example .env
# Open .env and paste in the same SUPABASE_URL and SUPABASE_SERVICE_KEY values
npm install
npm run dev:scrape
```

You should see output like:

```
[expire] Expired 0 past opportunities
[OpportunitiesForAfricans] Scraped 12 new, skipped 3 duplicates
[AfterSchoolAfrica] Scraped 8 new, skipped 5 duplicates
[Scholars4Dev] Scraped 6 new, skipped 9 duplicates
[summary] Total new: 26 | Skipped: 17 | Pages visited: 36
```

Then open your Supabase Dashboard → Table Editor → `opportunities` table — you should see rows with `status = pending`.

---

## Running locally

```bash
cd voila-scraper
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY in .env

npm install

# One-shot scrape (does not start the cron):
npm run dev:scrape

# Long-running cron (midnight UTC daily):
npm run dev
```

---

## Health endpoint

```
GET /health
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

---

## Admin review flow

Scraped opportunities are invisible to the Voila app until an admin approves them.

Every new opportunity lands with:
- `status = "pending"`
- `is_active = false`

**Approve** (makes the opportunity live):
```sql
select public.approve_opportunity('<opportunity_uuid>', '<admin_user_id>', 'Looks good');
```

**Reject:**
```sql
select public.reject_opportunity('<opportunity_uuid>', '<admin_user_id>', 'Not relevant');
```

You can also approve/reject from the Voila admin dashboard in the mobile app.

---

## Project structure

```
voila-scraper/
  src/
    scrapers/
      idealist.ts               # Idealist API (skipped if no API key)
      opportunitiesforafricans.ts
      afterschoolafrica.ts
      scholars4dev.ts
    types.ts                    # Shared TypeScript types
    config.ts                   # Env var loading
    utils.ts                    # HTTP, HTML parsing, date helpers
    classifier.ts               # Keyword-based field classification
    db.ts                       # Supabase client, duplicate check, upsert
    health.ts                   # Express /health endpoint
    index.ts                    # Orchestrator — scrape, classify, save
    cron.ts                     # node-cron entry point (daily midnight UTC)
  migration.sql                 # Run once in Supabase SQL Editor
  railway.json                  # Railway deployment config (auto-detected)
  .env.example                  # Copy to .env for local development
  package.json
  tsconfig.json
  README.md
```

---

## If a scraper stops finding listings

The web scrapers use CSS selectors based on common WordPress patterns. If a site redesigns, you will see:

```
[warn] HTTP 200 but no listings found at https://... — structure may have changed
```

Open the site in your browser → DevTools → inspect the listing cards → update the CSS selectors in `extractListingUrls()` for that scraper file. The scraper never crashes — it logs and continues with the other sources.
