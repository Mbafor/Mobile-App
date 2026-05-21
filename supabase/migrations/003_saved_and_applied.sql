-- Phase 4: apply URL + saved_opportunities + applied_opportunities

alter table public.opportunities
  add column if not exists apply_url text;

-- ---------------------------------------------------------------------------
-- saved_opportunities
-- ---------------------------------------------------------------------------
create table if not exists public.saved_opportunities (
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

create index if not exists saved_opportunities_user_idx
  on public.saved_opportunities (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- applied_opportunities
-- ---------------------------------------------------------------------------
create table if not exists public.applied_opportunities (
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  applied_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

create index if not exists applied_opportunities_user_idx
  on public.applied_opportunities (user_id, applied_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.saved_opportunities enable row level security;
alter table public.applied_opportunities enable row level security;

create policy "Users read own saved opportunities"
  on public.saved_opportunities for select
  using (auth.uid() = user_id);

create policy "Users save opportunities"
  on public.saved_opportunities for insert
  with check (auth.uid() = user_id);

create policy "Users unsave opportunities"
  on public.saved_opportunities for delete
  using (auth.uid() = user_id);

create policy "Users read own applied opportunities"
  on public.applied_opportunities for select
  using (auth.uid() = user_id);

create policy "Users mark applied"
  on public.applied_opportunities for insert
  with check (auth.uid() = user_id);

create policy "Users unmark applied"
  on public.applied_opportunities for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Apply URLs for seed listings (safe if rows already exist)
-- ---------------------------------------------------------------------------
update public.opportunities
set apply_url = 'https://example.com/apply/' || id::text
where apply_url is null
  and title <> 'Expired Listing (hidden)';
