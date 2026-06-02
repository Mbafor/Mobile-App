-- Help & Support tables: bugs, feature_requests, feedback

create table if not exists public.bugs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  title       text not null,
  description text not null,
  screenshot_url text,
  created_at  timestamptz not null default now()
);

create table if not exists public.feature_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  title       text not null,
  description text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete set null,
  rating     smallint not null check (rating between 1 and 5),
  comment    text not null default '',
  created_at timestamptz not null default now()
);

-- Only the submitting user (or admins) can read their own rows.
-- Anyone authenticated can insert.
alter table public.bugs          enable row level security;
alter table public.feature_requests enable row level security;
alter table public.feedback      enable row level security;

create policy "Users can insert bugs"
  on public.bugs for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can read own bugs"
  on public.bugs for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert feature requests"
  on public.feature_requests for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can read own feature requests"
  on public.feature_requests for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert feedback"
  on public.feedback for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can read own feedback"
  on public.feedback for select
  to authenticated
  using (user_id = auth.uid());

-- Storage bucket for bug screenshots (create manually in Supabase dashboard
-- or uncomment below if using the CLI with storage enabled)
-- insert into storage.buckets (id, name, public)
-- values ('bug-screenshots', 'bug-screenshots', true)
-- on conflict do nothing;
