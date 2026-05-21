# Phase 4 — Opportunity details setup

## 1. Run migration

In **Supabase → SQL Editor**, run:

`supabase/migrations/003_saved_and_applied.sql`

This adds:

| Object | Purpose |
|--------|---------|
| `opportunities.apply_url` | External apply link |
| `saved_opportunities` | Save / bookmark (DB-backed) |
| `applied_opportunities` | Mark as applied |

Also backfills `apply_url` on existing seed rows.

## 2. Test checklist

| Test | Steps |
|------|--------|
| Open details | Home → tap a card → detail screen loads |
| Apply Now | Tap **Apply Now** → browser opens (`https://example.com/apply/...`) |
| Save | Tap **Save** → `saved_opportunities` row created; card ★ updates |
| Mark applied | Tap **Mark applied** → `applied_opportunities` row; button shows **Applied ✓** |
| Share | Tap **Share** → system share sheet |

## 3. Notes

- Expired opportunities are hidden by RLS and cannot be opened from the feed.
- Save on home cards uses the same `saved_opportunities` table as the detail screen.
