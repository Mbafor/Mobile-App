-- Partner Program MVP: partner accounts, partner-curated posts, click attribution.
-- No changes to public.opportunities -- the "active pool" partners browse is the
-- existing status='approved' AND is_active=true filter (see 039_opportunity_approval_flow.sql
-- and 047_trending_opportunities.sql for the same pattern).

-- ---------------------------------------------------------------------------
-- partners: one row per partner org, one Supabase Auth user each (no self-signup;
-- rows are only ever created by the admin invite script using the service role key).
-- ---------------------------------------------------------------------------
create table if not exists public.partners (
  id            uuid primary key default gen_random_uuid(),
  org_name      text not null,
  slug          text not null unique,
  logo_url      text,
  contact_email text not null,
  ref_code      text not null unique,
  auth_user_id  uuid unique references auth.users (id) on delete set null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists idx_partners_auth_user_id on public.partners (auth_user_id);

alter table public.partners enable row level security;

create policy "Partners read own row"
  on public.partners for select
  to authenticated
  using (auth_user_id = auth.uid());

-- No insert/update/delete policy for authenticated/anon: rows are managed
-- exclusively via service-role (scripts/create-partner.mjs), enforcing
-- "no self-signup" at the database layer.

create or replace function public.current_partner_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.partners
  where auth_user_id = auth.uid() and is_active = true;
$$;

revoke all on function public.current_partner_id() from public;
grant execute on function public.current_partner_id() to authenticated;

create or replace function public.current_partner_ref_code()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select ref_code from public.partners
  where auth_user_id = auth.uid() and is_active = true;
$$;

revoke all on function public.current_partner_ref_code() from public;
grant execute on function public.current_partner_ref_code() to authenticated;

-- ---------------------------------------------------------------------------
-- partner_posts: opportunities a partner has chosen to publish to their own
-- public page. Posting is immediate -- no approval step.
-- ---------------------------------------------------------------------------
create table if not exists public.partner_posts (
  id             uuid primary key default gen_random_uuid(),
  partner_id     uuid not null references public.partners (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  posted_at      timestamptz not null default now(),
  digest_slug    text,
  unique (partner_id, opportunity_id)
);

create index if not exists idx_partner_posts_partner on public.partner_posts (partner_id);
create index if not exists idx_partner_posts_opportunity on public.partner_posts (opportunity_id);

alter table public.partner_posts enable row level security;

create policy "Partners read own posts"
  on public.partner_posts for select
  to authenticated
  using (partner_id = public.current_partner_id());

create policy "Partners insert own posts"
  on public.partner_posts for insert
  to authenticated
  with check (partner_id = public.current_partner_id());

-- ---------------------------------------------------------------------------
-- link_clicks: attribution log for /o/[id]?ref=... hits. Written only by the
-- bridge page route using the service role key (public visitors never touch
-- Postgres directly).
-- ---------------------------------------------------------------------------
create table if not exists public.link_clicks (
  id             uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunities (id) on delete set null,
  ref_code       text,
  clicked_at     timestamptz not null default now()
);

create index if not exists idx_link_clicks_ref_code on public.link_clicks (ref_code);
create index if not exists idx_link_clicks_opportunity on public.link_clicks (opportunity_id);

alter table public.link_clicks enable row level security;

create policy "Partners read own clicks"
  on public.link_clicks for select
  to authenticated
  using (ref_code = public.current_partner_ref_code());

-- No insert policy for authenticated/anon: only the service-role bridge route writes.
