# Phase 6 & 7 — Search, filters, and dashboard

## Migration

Run in Supabase SQL Editor:

`supabase/migrations/004_search_filters.sql`

Adds to `opportunities`:

- `country`, `category`, `funding_type`, `degree_levels[]`, `location_type`
- Backfills filter fields on seed listings

## Phase 6 — Search (Dashboard)

| Feature | Behavior |
|---------|----------|
| Search bar | Top of **Dashboard** tab |
| Search | Matches **title**, **organization**, and **tags** (300ms debounce) |
| Filters | Country, category, funding, degree, remote/on-site, deadline window |
| Results | Replaces dashboard sections while searching; tap → opportunity details |

Filtering runs client-side on the cached active opportunities list (fast for MVP scale).

## Saved tab

| Feature | Behavior |
|---------|----------|
| List | All saved opportunities (newest save first), still active in feed |
| Empty state | Prompt to save from dashboard or detail screen |

## Phase 7 — Dashboard tab

| Widget | Source |
|--------|--------|
| Saved count | `saved_opportunities` count query |
| Applied count | `applied_opportunities` count query |
| Recommended For You | `profiles.interests` + `user_preferences.opportunity_types` matched to opportunity `tags`; ranked by match count (min 1 tag match) |
| Recently Uploaded | Newest listings |
| Closing Soon | Deadline within 14 days |

Bottom tabs: **Dashboard**, **Saved**, **Notifications**, **Settings** (+ **Admin** when `is_admin`).

Pull to refresh updates opportunities **and** counts.

Counts update live when you save or mark applied on the detail screen (query invalidation).

## Test checklist

### Search
- [ ] Search by organization name → correct results
- [ ] Filter by country + category → results narrow accurately
- [ ] Clear filters → full list returns

### Dashboard
- [ ] Save an opportunity → Saved count increases
- [ ] Mark applied → Applied count increases
- [ ] Pull to refresh → counts stay in sync
