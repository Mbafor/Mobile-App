Here's the complete combined prompt:

---

```
I'm building an automated opportunity scraper for Voila (voila-africa.com), a youth mentorship and career development platform built with React Native, TypeScript, Supabase, and Node.js.

## TASK
Build a production-ready Node.js/TypeScript scraper that:
1. Scrapes youth opportunities from 4 approved sources
2. Classifies each opportunity using the exact field schema below
3. Saves everything to Supabase with status "pending" for admin review
4. Runs automatically once a day at midnight UTC via cron
5. Supports an admin dashboard flow where admins verify, edit, and validate each opportunity before it goes live

---

## APPROVED SOURCES (in priority order)

1. **Idealist.org** — Use their Open Network API. API key via env var IDEALIST_API_KEY. Fetch newest listings first using their sort/order parameters.
2. **Opportunities for Africans** — https://www.opportunitiesforafricans.com — WordPress site, scrape with pagination, newest first.
3. **After School Africa** — https://www.afterschoolafrica.com — scrape with pagination, newest first.
4. **Scholars4Dev** — https://www.scholars4dev.com — scrape with pagination, newest first.

**Scraping rules (MUST follow for all non-API sources):**
- 2–3 second random delay between every request
- User-Agent header: `Voila-Bot/1.0 (voila-africa.com)`
- Check and respect robots.txt before scraping each site
- Max 1 request per 3 seconds per domain
- If a site returns 429 or 403: stop that source, log the error, move to the next source — never crash the whole run
- If a site's HTML structure changes and parsing fails: log a warning with the URL, skip that item, continue

---

## SCRAPING LIMITS & PRIORITY

- Max 100 opportunities per source per run (400 total)
- Always scrape newest / most recently posted first
- Start from page 1 (most recent) and keep paginating until 100 NEW non-duplicate opportunities are collected from that source
- Before counting toward the 100 limit, check if apply_url already exists in Supabase — if it does, skip it and continue paginating
- Stop paginating when either 100 new opportunities are found OR no more pages exist

**Per-source log after each source completes:**
"[Source Name] — Scraped: X | New: X | Skipped (duplicate): X | Pages visited: X"

**Final run summary:**
"===== RUN COMPLETE [timestamp] =====
Opportunities for Africans — New: X | Skipped: X
After School Africa        — New: X | Skipped: X
Scholars4Dev               — New: X | Skipped: X
Idealist API               — New: X | Skipped: X
------------------------------------------
Total New: X | Total Skipped: X | Errors: X
All pending. Awaiting admin review."

---

## EXACT FIELD SCHEMA

Every scraped opportunity must map to exactly these fields:

```ts
{
  title: string         // full opportunity name
  organization: string  // issuing body / company / institution
  description: string   // 2-3 sentence summary of what it is and who it's for
  deadline: string      // YYYY-MM-DD format, or "" if not found
  applyUrl: string      // direct application URL — used as unique key
  imageUrl: string      // banner or logo image URL, or "" if not found

  category: string      // pick ONE:
                        // "Internship" | "Scholarship" | "Fellowship" |
                        // "Graduate Programme" | "Job (Full-time)" | "Job (Part-time)" |
                        // "Volunteer" | "Research Opportunity" | "Exchange Programme" |
                        // "Bootcamp & Training" | "Grant & Funding" | "Competition & Award"

  country: string       // host country e.g. "South Africa", or "Global" for worldwide

  tags: string[]        // 1–3 items ONLY from:
                        // "Technology & Innovation" | "Research & Academia" |
                        // "Entrepreneurship" | "Leadership & Management" |
                        // "Creative Arts & Design" | "Community & Social Impact" |
                        // "Finance & Investment" | "Healthcare & Wellness" |
                        // "Sustainability & Environment" | "Data & Analytics" |
                        // "Policy & Governance" | "Marketing & Branding"

  fundingType: string   // "fully_funded" | "partially_funded" | "self_funded"

  degreeLevels: string[] // any of: "high_school" | "bachelors" | "masters" | "phd" | "professional"
                         // Use [] if not applicable (jobs, volunteer roles, etc.)

  locationType: string  // "remote" | "onsite" | "hybrid"
}
```

---

## CLASSIFICATION LOGIC

Build a `classifier.ts` module. Use keyword and pattern matching to fill all fields. Rules:

**category:**
- "scholarship", "tuition", "study award", "bursary" → "Scholarship"
- "internship", "intern" → "Internship"
- "fellowship" → "Fellowship"
- "graduate programme", "graduate program", "grad scheme" → "Graduate Programme"
- "full-time", "full time", "permanent" → "Job (Full-time)"
- "part-time", "part time" → "Job (Part-time)"
- "volunteer", "volunteering" → "Volunteer"
- "research", "researcher", "research opportunity" → "Research Opportunity"
- "exchange", "exchange programme" → "Exchange Programme"
- "bootcamp", "training", "course", "workshop" → "Bootcamp & Training"
- "grant", "funding", "seed fund" → "Grant & Funding"
- "competition", "award", "prize", "challenge" → "Competition & Award"
- Default → "Internship" (most common — admin can correct)

**fundingType:**
- "fully funded", "all expenses", "full scholarship", "covers tuition", "stipend + accommodation", "expenses covered" → "fully_funded"
- "partial", "partially funded", "some funding", "travel grant" → "partially_funded"
- No funding mentioned, "self-funded", "unpaid" → "self_funded"

**locationType:**
- "remote", "virtual", "online", "work from home" → "remote"
- "hybrid" → "hybrid"
- Default → "onsite"

**degreeLevels:**
- "undergraduate", "bachelor", "bsc", "ba " → ["bachelors"]
- "master", "msc", "mba", "postgraduate" → ["masters"]
- "phd", "doctorate", "dphil" → ["phd"]
- "high school", "secondary school", "o level", "a level" → ["high_school"]
- "professional", "working professional" → ["professional"]
- Multiple matches → return all that match
- No match → []

**country:**
- Scan title and description for country names
- "global", "worldwide", "all countries", "international", "anywhere" → "Global"
- Extract the most specific country mentioned
- Default → "Global"

**tags:**
- Match description keywords to the allowed tag list
- Pick 1–3 most relevant only
- "tech", "software", "AI", "coding", "digital" → "Technology & Innovation"
- "research", "academic", "science", "lab" → "Research & Academia"
- "startup", "entrepreneur", "business", "innovation" → "Entrepreneurship"
- "leadership", "management", "executive" → "Leadership & Management"
- "design", "art", "creative", "media", "film" → "Creative Arts & Design"
- "community", "social", "NGO", "nonprofit", "development" → "Community & Social Impact"
- "finance", "investment", "banking", "economics" → "Finance & Investment"
- "health", "medical", "wellness", "clinical" → "Healthcare & Wellness"
- "environment", "climate", "sustainability", "green" → "Sustainability & Environment"
- "data", "analytics", "statistics", "ML" → "Data & Analytics"
- "policy", "governance", "law", "government" → "Policy & Governance"
- "marketing", "brand", "communications", "PR" → "Marketing & Branding"

**Low confidence rule:** If confidence is low on any field, leave it as "" or [] — the admin will correct it during review. Never guess wildly; a blank is better than a wrong value.

---

## ADMIN REVIEW FLOW

All scraped opportunities land in Supabase with `status = "pending"` and `is_active = false`. They do NOT appear in the Voila app until an admin approves them.

Each Supabase row also includes these admin fields:

```ts
{
  id: uuid                 // auto-generated
  status: string           // "pending" | "approved" | "rejected"
  source: string           // which site it was scraped from
  scraped_at: timestamptz  // when it was scraped
  reviewed_at: timestamptz // null until admin acts
  reviewed_by: string      // admin user ID, null until reviewed
  admin_notes: string      // optional notes from admin
  is_active: boolean       // true only after approval and before deadline
  created_at: timestamptz
  updated_at: timestamptz
}
```

**Admin workflow:**
- Admin opens dashboard → sees all `status = "pending"` opportunities in a queue
- Every field is editable — admin corrects anything the classifier got wrong
- Approve → status = "approved", is_active = true, reviewed_at + reviewed_by set
- Reject → status = "rejected", is_active = false
- Only `status = "approved"` AND `is_active = true` records are returned to the Voila app

---

## SUPABASE SCHEMA

Run this migration first before any scraper code:

```sql
create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),

  -- Core fields (editable by admin)
  title text not null,
  organization text,
  description text,
  deadline date,
  apply_url text unique not null,
  image_url text,

  -- Classification (editable by admin)
  category text,
  country text,
  tags text[],
  funding_type text,
  degree_levels text[],
  location_type text,

  -- Admin review
  status text not null default 'pending',
  source text,
  scraped_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by text,
  admin_notes text,
  is_active boolean default false,

  -- Meta
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for app filters
create index if not exists idx_opp_status on opportunities(status);
create index if not exists idx_opp_is_active on opportunities(is_active);
create index if not exists idx_opp_category on opportunities(category);
create index if not exists idx_opp_country on opportunities(country);
create index if not exists idx_opp_funding_type on opportunities(funding_type);
create index if not exists idx_opp_location_type on opportunities(location_type);
create index if not exists idx_opp_deadline on opportunities(deadline);
create index if not exists idx_opp_tags on opportunities using gin(tags);
create index if not exists idx_opp_degree_levels on opportunities using gin(degree_levels);

-- Auto-update updated_at on every row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger opportunities_updated_at
  before update on opportunities
  for each row execute function update_updated_at();

-- Auto-expire opportunities whose deadline has passed
create or replace function expire_past_opportunities()
returns void as $$
begin
  update opportunities
  set is_active = false
  where status = 'approved'
    and is_active = true
    and deadline is not null
    and deadline < current_date;
end;
$$ language plpgsql;

-- Admin RPC functions
create or replace function approve_opportunity(
  opportunity_id uuid,
  admin_id text,
  notes text default null
)
returns void as $$
begin
  update opportunities set
    status = 'approved',
    is_active = true,
    reviewed_at = now(),
    reviewed_by = admin_id,
    admin_notes = notes
  where id = opportunity_id;
end;
$$ language plpgsql;

create or replace function reject_opportunity(
  opportunity_id uuid,
  admin_id text,
  notes text default null
)
returns void as $$
begin
  update opportunities set
    status = 'rejected',
    is_active = false,
    reviewed_at = now(),
    reviewed_by = admin_id,
    admin_notes = notes
  where id = opportunity_id;
end;
$$ language plpgsql;
```

---

## SCHEDULING

The scraper runs once daily at midnight UTC as a long-running Node.js process on Railway or Render.

**cron.ts:**
- Use `node-cron` with schedule `0 0 * * *`
- On boot: log "Voila Scraper started — running daily at midnight UTC"
- On each run: log start time, run full orchestrator, log final summary
- Catch all errors without crashing — next run must always fire
- Also call `expire_past_opportunities()` RPC at the start of every run to clean up expired listings before scraping new ones

**Add a lightweight Express health endpoint:**
- `GET /health` → `{ status: "ok", lastRun: "<timestamp>", nextRun: "<next midnight UTC>", lastRunSummary: { new: X, skipped: X, errors: X } }`
- Railway/Render uses this for health checks

**package.json scripts:**
```json
"scripts": {
  "start": "ts-node src/cron.ts",
  "scrape:now": "ts-node src/index.ts"
}
```

`scrape:now` manually triggers a full run without waiting for midnight — use this for testing.

**Railway/Render setup:**
- Start command: `npm start`
- Add all env vars in the dashboard: SUPABASE_URL, SUPABASE_SERVICE_KEY, IDEALIST_API_KEY

---

## PROJECT STRUCTURE

```
voila-scraper/
  src/
    scrapers/
      idealist.ts               # Idealist API integration
      opportunitiesforafricans.ts
      afterschoolafrica.ts
      scholars4dev.ts
    classifier.ts               # keyword classification logic
    db.ts                       # supabase upsert, duplicate check, expire RPC
    health.ts                   # express health endpoint
    cron.ts                     # node-cron scheduler (entry point)
    index.ts                    # orchestrator — runs all scrapers, classifies, saves
  .env
  package.json
  tsconfig.json
  README.md                     # setup instructions, env vars, how to deploy to Railway/Render
```

---

## TECH STACK & PACKAGES

Install:
```
axios cheerio @supabase/supabase-js dotenv node-cron express @types/node @types/express @types/node-cron ts-node typescript
```

---

## ENV VARS

```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
IDEALIST_API_KEY=
PORT=3000
```

---

## QUALITY RULES

- Every scraper must handle missing fields gracefully — never throw on a null title, image, or deadline
- If title is missing from a listing, skip it entirely and log the URL
- If deadline cannot be parsed into YYYY-MM-DD, store as null — never store a malformed date
- All description text must be stripped of HTML tags before saving
- imageUrl must be an absolute URL — convert relative URLs to absolute using the source domain
- applyUrl must be an absolute URL — skip any listing where this cannot be determined
- Never store personal data (applicant names, emails, phone numbers)
- TypeScript strict mode on — no `any` types

---

## BUILD ORDER

Build in this exact order:
1. Supabase migration (run and confirm it works)
2. db.ts (upsert + duplicate check + expire RPC call)
3. classifier.ts (full classification logic for all fields)
4. Each scraper one by one — test each individually with `scrape:now` before moving to the next
5. index.ts (orchestrator wiring all scrapers + classifier + db together)
6. health.ts (Express endpoint)
7. cron.ts (scheduler)
8. README.md (setup + deploy instructions)
```

---

That's the full production prompt. It covers everything — scraping, classification, admin flow, scheduling, expiry, health checks, error handling, and deploy config. Hand this to Claude Code and it should be able to build the entire thing end to end without needing follow-up clarification.