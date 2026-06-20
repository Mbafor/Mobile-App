-- Wire the scraper → admin review → student feed pipeline.
-- Safe to run on an existing database. Uses only ALTER/CREATE OR REPLACE/DROP IF EXISTS.
-- Do NOT run voila-scraper/migration.sql — this file replaces it for existing installations.
--
-- What this does:
--   1. Adds scraper columns to the existing opportunities table (from migration 002)
--   2. Backfills seed/admin-created rows so they stay visible to students
--   3. Replaces the student RLS policy to filter on approved+active rows only
--   4. Adds approve_opportunity / reject_opportunity RPCs for the mobile admin UI
--   5. Adds expire_past_opportunities RPC called by the scraper at midnight
--   6. Adds performance indexes for scraper filter columns

-- ---------------------------------------------------------------------------
-- 1. Add scraper columns — all IF NOT EXISTS, fully safe on existing table
-- ---------------------------------------------------------------------------
alter table public.opportunities add column if not exists status        text    not null default 'pending';
alter table public.opportunities add column if not exists is_active     boolean not null default false;
alter table public.opportunities add column if not exists source        text;
alter table public.opportunities add column if not exists apply_url     text    unique;
alter table public.opportunities add column if not exists scraped_at    timestamptz default now();
alter table public.opportunities add column if not exists reviewed_at   timestamptz;
alter table public.opportunities add column if not exists reviewed_by   text;
alter table public.opportunities add column if not exists admin_notes   text;
alter table public.opportunities add column if not exists category      text;
alter table public.opportunities add column if not exists country       text;
alter table public.opportunities add column if not exists funding_type  text;
alter table public.opportunities add column if not exists degree_levels text[] default '{}';
alter table public.opportunities add column if not exists location_type text;

-- Status constraint (drop first so rerunning is safe)
alter table public.opportunities drop constraint if exists opportunities_status_check;
alter table public.opportunities
  add constraint opportunities_status_check
  check (status in ('pending', 'approved', 'rejected'));

-- ---------------------------------------------------------------------------
-- 2. Backfill — rows without a source were created manually by admins.
--    They must stay visible to students; set them to approved+active now.
--    The seed rows from migration 002 have no source and no apply_url,
--    so this catches them all cleanly.
-- ---------------------------------------------------------------------------
update public.opportunities
set    status    = 'approved',
       is_active = true
where  source is null
  and  status   = 'pending';

-- ---------------------------------------------------------------------------
-- 3. Fix student RLS
--    Old policy only checked deadline > now().
--    New policy also requires status='approved' and is_active=true so
--    scraped rows stay hidden until an admin approves them.
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated users can read active opportunities" on public.opportunities;
drop policy if exists "Students can read approved active opportunities"    on public.opportunities;

create policy "Students can read approved active opportunities"
  on public.opportunities for select to authenticated
  using (
    deadline  > now()
    and status    = 'approved'
    and is_active = true
  );

-- ---------------------------------------------------------------------------
-- 4. Performance indexes for scraper filter columns
-- ---------------------------------------------------------------------------
create index if not exists idx_opp_status        on public.opportunities (status);
create index if not exists idx_opp_is_active     on public.opportunities (is_active);
create index if not exists idx_opp_apply_url     on public.opportunities (apply_url);
create index if not exists idx_opp_source        on public.opportunities (source);
create index if not exists idx_opp_category      on public.opportunities (category);
create index if not exists idx_opp_country       on public.opportunities (country);
create index if not exists idx_opp_funding_type  on public.opportunities (funding_type);
create index if not exists idx_opp_location_type on public.opportunities (location_type);
create index if not exists idx_opp_tags          on public.opportunities using gin (tags);
create index if not exists idx_opp_degree_levels on public.opportunities using gin (degree_levels);

-- ---------------------------------------------------------------------------
-- 5. expire_past_opportunities — called by the scraper at the start of every run.
--    Marks approved opportunities whose deadline has passed as inactive
--    so they drop out of the student feed automatically.
-- ---------------------------------------------------------------------------
create or replace function public.expire_past_opportunities()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.opportunities
  set    is_active = false
  where  status    = 'approved'
    and  is_active = true
    and  deadline  < now();
end;
$$;

grant execute on function public.expire_past_opportunities() to service_role;

-- ---------------------------------------------------------------------------
-- 6. approve_opportunity — called from the admin mobile UI
--    Drops any old overloads left by voila-scraper/migration.sql
-- ---------------------------------------------------------------------------
drop function if exists public.approve_opportunity(uuid, text, text);
drop function if exists public.approve_opportunity(uuid, text);

create or replace function public.approve_opportunity(
  p_opportunity_id uuid,
  p_notes          text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_user_can_manage_opportunities() then
    raise exception 'permission denied' using errcode = '42501';
  end if;

  update public.opportunities set
    status      = 'approved',
    is_active   = true,
    reviewed_at = now(),
    reviewed_by = auth.uid()::text,
    admin_notes = coalesce(nullif(trim(p_notes), ''), admin_notes)
  where id = p_opportunity_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. reject_opportunity — called from the admin mobile UI
-- ---------------------------------------------------------------------------
drop function if exists public.reject_opportunity(uuid, text, text);
drop function if exists public.reject_opportunity(uuid, text);

create or replace function public.reject_opportunity(
  p_opportunity_id uuid,
  p_notes          text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_user_can_manage_opportunities() then
    raise exception 'permission denied' using errcode = '42501';
  end if;

  update public.opportunities set
    status      = 'rejected',
    is_active   = false,
    reviewed_at = now(),
    reviewed_by = auth.uid()::text,
    admin_notes = coalesce(nullif(trim(p_notes), ''), admin_notes)
  where id = p_opportunity_id;
end;
$$;

grant execute on function public.approve_opportunity(uuid, text) to authenticated;
grant execute on function public.reject_opportunity(uuid, text)  to authenticated;
