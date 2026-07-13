-- Weekly Digest admin tool: track send history per opportunity and record
-- published digests so /digest/[slug] can render a co-brandable public archive.

alter table public.opportunities
  add column if not exists last_sent_at timestamptz,
  add column if not exists times_sent integer not null default 0;

-- ---------------------------------------------------------------------------
-- sent_digests: one row per publish/share action. `slug` is added beyond the
-- literal spec (id, sent_at, opportunity_ids, channel, created_by) because the
-- public /digest/[slug] page needs a stable key to look rows up by; all rows
-- published together share the same slug (one per calendar week the admin
-- publishes), so the public page reads the most recent matching row.
-- ---------------------------------------------------------------------------
create table if not exists public.sent_digests (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null,
  sent_at        timestamptz not null default now(),
  opportunity_ids uuid[] not null,
  channel        text,
  created_by     uuid references auth.users (id) on delete set null
);

create index if not exists idx_sent_digests_slug on public.sent_digests (slug);
create index if not exists idx_sent_digests_sent_at on public.sent_digests (sent_at desc);

alter table public.sent_digests enable row level security;

create policy "Admins can read sent digests"
  on public.sent_digests for select
  to authenticated
  using (public.current_user_can_manage_opportunities());

create policy "Admins can insert sent digests"
  on public.sent_digests for insert
  to authenticated
  with check (public.current_user_can_manage_opportunities());

-- No anon/public policy: /digest/[slug] is rendered via a service-role client
-- (same pattern as the bridge page and public partner page), so it needs no
-- RLS surface of its own.

-- Note: opportunities.last_sent_at / times_sent updates are already covered by
-- the existing admin update policy from 019_admin_super_admin_roles.sql
-- ("... for update using (current_user_can_manage_opportunities())") -- no
-- additional policy needed here.

-- ---------------------------------------------------------------------------
-- bump_opportunity_sends: atomic last_sent_at/times_sent bump for a batch of
-- ids. Plain (non-security-definer) function so the existing RLS update
-- policy on opportunities still applies to the calling admin's own session.
-- ---------------------------------------------------------------------------
create or replace function public.bump_opportunity_sends(p_ids uuid[])
returns void
language sql
as $$
  update public.opportunities
  set last_sent_at = now(),
      times_sent = times_sent + 1
  where id = any(p_ids);
$$;

revoke all on function public.bump_opportunity_sends(uuid[]) from public;
grant execute on function public.bump_opportunity_sends(uuid[]) to authenticated;
