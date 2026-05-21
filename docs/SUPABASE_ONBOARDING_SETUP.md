# Supabase setup — Phase 2 Onboarding

## 1. Run the migration

In **Supabase Dashboard → SQL Editor**, paste and run:

`supabase/migrations/001_profiles_and_preferences.sql`

This creates:

| Table | Purpose |
|-------|---------|
| `profiles` | Full name, country, university, degree, interests, `onboarding_complete` |
| `user_preferences` | Opportunity types, preferred countries, funding preference |

Also adds RLS policies, `updated_at` triggers, and a trigger to create rows when a user signs up.

## 2. Existing users (signed up before migration)

Run once to backfill profiles for users already in `auth.users`:

```sql
insert into public.profiles (id, email, onboarding_complete)
select id, email, false from auth.users
on conflict (id) do nothing;

insert into public.user_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;
```

## 3. App flow

1. User signs up / logs in  
2. If `profiles.onboarding_complete = false` → **Basic information → Academic → Opportunity preferences**  
3. No skip; back only between steps 2–3  
4. **Settings → Profile & preferences** to edit later  

## 4. Test checklist

| Test | Expected |
|------|----------|
| Data saves | After each step, rows update in `profiles` / `user_preferences` in Table Editor |
| Cannot skip | Main app blocked until step 3 finishes; no skip button |
| Edit later | Settings → Profile & preferences → Save → DB updated |
| Session | After finish, reopen app → Dashboard (not onboarding) |

## 5. Troubleshooting

- **permission denied for table profiles** — Run migration RLS policies; user must be logged in.  
- **Row not created on signup** — Run backfill SQL above; or complete step 1 (creates/updates profile).  
- **Still stuck in onboarding** — Set `onboarding_complete = true` in `profiles` only after all required fields are filled, or finish step 3 in the app.
