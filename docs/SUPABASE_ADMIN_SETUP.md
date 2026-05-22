# Supabase admin setup

## Migration

Run `supabase/migrations/007_admin.sql` in the Supabase SQL Editor (after migrations 001–006).

This adds:

- `profiles.is_admin` (`boolean not null default false`)
- RLS so admins can create, update, delete, and read all opportunities (including expired)
- `get_admin_dashboard_stats()` RPC for simple counts
- Run `supabase/migrations/008_admin_analytics.sql` for `get_admin_analytics()` (full admin dashboard)

## Grant admin access

In the SQL Editor, set your user as admin (use your auth user id from **Authentication → Users**):

```sql
update public.profiles
set is_admin = true
where id = 'YOUR_USER_UUID';
```

Sign out and sign back in (or restart the app) so the profile reloads.

## App behavior

- The **Admin** tab appears only when `profiles.is_admin = true`.
- Non-admins never see the tab; direct navigation to admin routes redirects to the dashboard.
- Admins can create, edit, and delete opportunities with the same fields students see in search and detail views.
- **Deadline must be in the future** — student feeds only show rows where `deadline > now()` (RLS). Past deadlines save for admins but are hidden from students.
- The Admin tab dashboard shows user, opportunity, engagement, and notification analytics with bar/pie charts (`react-native-gifted-charts`).
