# Supabase setup — Phase 3 Opportunities (Home)

## 1. Run the migration

In **Supabase Dashboard → SQL Editor**, run:

`supabase/migrations/002_opportunities.sql`

This creates the `opportunities` table, RLS (authenticated users only see rows where `deadline > now()`), and **8 sample listings** plus one expired row (hidden).

## 2. Verify RLS

- Signed-in users should see active opportunities only.
- The row titled **"Expired Listing (hidden)"** must **not** appear in the app.

## 3. Home screen sections

| Section | Logic |
|---------|--------|
| **Recommended For You** | Tag overlap with profile `interests` + `user_preferences.opportunity_types`, then newest |
| **Recently Uploaded** | Newest `created_at` first |
| **Closing Soon** | Deadline within 14 days, soonest first |

## 4. Test checklist

| Test | Expected |
|------|----------|
| Opportunities display | Home tab shows cards in all three sections |
| Expired hidden | Expired seed row never appears |
| Smooth scroll | Vertical feed + horizontal card rows scroll without jank |
| Bookmark | Tap ☆ on a card → persists after app restart |
| Share | Tap ↗ opens system share sheet |

## 5. Pull to refresh

Pull down on Home to refetch from Supabase.

## 6. Troubleshooting

- **Empty sections** — Confirm migration ran and you are logged in.
- **permission denied** — RLS requires `authenticated` role; check session.
- **Images not loading** — Device needs network; URLs use Unsplash CDN.
