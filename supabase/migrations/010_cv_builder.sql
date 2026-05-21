-- CV Builder: cvs + cv_payments (Step 1)
-- Run in Supabase SQL Editor or via: supabase db push

-- ---------------------------------------------------------------------------
-- cvs
-- ---------------------------------------------------------------------------
create table if not exists public.cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'My CV',
  template_id text not null default 'classic',
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cvs_user_id_idx on public.cvs (user_id);

drop trigger if exists cvs_updated_at on public.cvs;
create trigger cvs_updated_at
  before update on public.cvs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- cv_payments
-- ---------------------------------------------------------------------------
create table if not exists public.cv_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cv_id uuid not null references public.cvs (id) on delete cascade,
  amount numeric not null,
  type text not null check (type in ('download', 'template_unlock')),
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  paystack_reference text,
  created_at timestamptz not null default now()
);

create index if not exists cv_payments_user_id_idx on public.cv_payments (user_id);
create index if not exists cv_payments_cv_id_idx on public.cv_payments (cv_id);

-- ---------------------------------------------------------------------------
-- RLS: cvs
-- ---------------------------------------------------------------------------
alter table public.cvs enable row level security;

create policy "Users can read own cvs"
  on public.cvs for select
  using (auth.uid() = user_id);

create policy "Users can insert own cvs"
  on public.cvs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cvs"
  on public.cvs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cvs"
  on public.cvs for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RLS: cv_payments
-- ---------------------------------------------------------------------------
alter table public.cv_payments enable row level security;

create policy "Users can read own cv_payments"
  on public.cv_payments for select
  using (auth.uid() = user_id);

create policy "Users can insert own cv_payments"
  on public.cv_payments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.cvs
      where cvs.id = cv_id
        and cvs.user_id = auth.uid()
    )
  );

create policy "Users can update own cv_payments"
  on public.cv_payments for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.cvs
      where cvs.id = cv_id
        and cvs.user_id = auth.uid()
    )
  );

create policy "Users can delete own cv_payments"
  on public.cv_payments for delete
  using (auth.uid() = user_id);
