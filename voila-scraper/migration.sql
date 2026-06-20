-- Run this in your Supabase SQL Editor before starting the scraper.
-- Safe to run on both fresh databases and existing installations.
-- The app already has an opportunities table (migration 002); this file
-- extends it with scraper-specific columns using ADD COLUMN IF NOT EXISTS.

-- ---------------------------------------------------------------------------
-- For fresh databases: create the full table
-- ---------------------------------------------------------------------------
create table if not exists public.opportunities (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  organization text,
  description text,
  deadline    timestamptz,
  apply_url   text unique,
  image_url   text,
  category    text,
  country     text,
  tags        text[] default '{}',
  funding_type  text,
  degree_levels text[] default '{}',
  location_type text,
  status      text not null default 'pending',
  source      text,
  scraped_at  timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by text,
  admin_notes text,
  is_active   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- For existing databases: add the scraper columns that migration 002 doesn't have
-- ---------------------------------------------------------------------------
alter table public.opportunities add column if not exists apply_url      text unique;
alter table public.opportunities add column if not exists category       text;
alter table public.opportunities add column if not exists country        text;
alter table public.opportunities add column if not exists funding_type   text;
alter table public.opportunities add column if not exists degree_levels  text[] default '{}';
alter table public.opportunities add column if not exists location_type  text;
alter table public.opportunities add column if not exists status         text not null default 'pending';
alter table public.opportunities add column if not exists source         text;
alter table public.opportunities add column if not exists scraped_at     timestamptz default now();
alter table public.opportunities add column if not exists reviewed_at    timestamptz;
alter table public.opportunities add column if not exists reviewed_by    text;
alter table public.opportunities add column if not exists admin_notes    text;
alter table public.opportunities add column if not exists is_active      boolean not null default false;

-- Status check constraint (drop first so re-running is safe)
alter table public.opportunities drop constraint if exists opportunities_status_check;
alter table public.opportunities
  add constraint opportunities_status_check
  check (status in ('pending', 'approved', 'rejected'));

-- ---------------------------------------------------------------------------
-- Indexes for app filters
-- ---------------------------------------------------------------------------
create index if not exists idx_opp_status        on public.opportunities(status);
create index if not exists idx_opp_is_active     on public.opportunities(is_active);
create index if not exists idx_opp_category      on public.opportunities(category);
create index if not exists idx_opp_country       on public.opportunities(country);
create index if not exists idx_opp_funding_type  on public.opportunities(funding_type);
create index if not exists idx_opp_location_type on public.opportunities(location_type);
create index if not exists idx_opp_deadline      on public.opportunities(deadline);
create index if not exists idx_opp_tags          on public.opportunities using gin(tags);
create index if not exists idx_opp_degree_levels on public.opportunities using gin(degree_levels);
create index if not exists idx_opp_apply_url     on public.opportunities(apply_url);

-- ---------------------------------------------------------------------------
-- Auto-update updated_at
-- ---------------------------------------------------------------------------
create or replace function public.update_opportunities_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists opportunities_updated_at on public.opportunities;
create trigger opportunities_updated_at
  before update on public.opportunities
  for each row execute function public.update_opportunities_updated_at();

-- ---------------------------------------------------------------------------
-- Admin RPCs
-- ---------------------------------------------------------------------------
create or replace function public.expire_past_opportunities()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.opportunities
  set is_active = false
  where status = 'approved'
    and is_active = true
    and deadline is not null
    and deadline < now();
end;
$$;

create or replace function public.approve_opportunity(
  opportunity_id uuid,
  admin_id       text,
  notes          text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.opportunities set
    status      = 'approved',
    is_active   = true,
    reviewed_at = now(),
    reviewed_by = admin_id,
    admin_notes = notes
  where id = opportunity_id;
end;
$$;

create or replace function public.reject_opportunity(
  opportunity_id uuid,
  admin_id       text,
  notes          text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.opportunities set
    status      = 'rejected',
    is_active   = false,
    reviewed_at = now(),
    reviewed_by = admin_id,
    admin_notes = notes
  where id = opportunity_id;
end;
$$;

-- Grant service role access (scraper uses service-role key)
grant all on public.opportunities to service_role;
grant execute on function public.expire_past_opportunities()                   to service_role;
grant execute on function public.approve_opportunity(uuid, text, text)         to service_role;
grant execute on function public.reject_opportunity(uuid, text, text)          to service_role;
