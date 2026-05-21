-- Phase 8: push tokens, notification preferences, in-app notification history

-- ---------------------------------------------------------------------------
-- notification_preferences (1:1 per user)
-- ---------------------------------------------------------------------------
create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  push_enabled boolean not null default true,
  new_matches boolean not null default true,
  deadline_reminders boolean not null default true,
  saved_reminders boolean not null default true,
  last_match_sync_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- user_push_tokens
-- ---------------------------------------------------------------------------
create table if not exists public.user_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  expo_push_token text not null,
  platform text,
  device_id text,
  updated_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

create index if not exists user_push_tokens_user_idx on public.user_push_tokens (user_id);

-- ---------------------------------------------------------------------------
-- notifications (in-app history + dedupe for push)
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('new_match', 'deadline_reminder', 'saved_reminder')),
  title text not null,
  body text not null,
  opportunity_id uuid references public.opportunities (id) on delete set null,
  dedupe_key text not null,
  read_at timestamptz,
  push_sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id)
  where read_at is null;

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
drop trigger if exists notification_preferences_updated_at on public.notification_preferences;
create trigger notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- auto-create preferences on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user_notification_prefs()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_notification_prefs on auth.users;
create trigger on_auth_user_notification_prefs
  after insert on auth.users
  for each row execute function public.handle_new_user_notification_prefs();

-- Backfill existing users
insert into public.notification_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.notification_preferences enable row level security;
alter table public.user_push_tokens enable row level security;
alter table public.notifications enable row level security;

create policy "Users read own notification preferences"
  on public.notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users update own notification preferences"
  on public.notification_preferences for update
  using (auth.uid() = user_id);

create policy "Users insert own notification preferences"
  on public.notification_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users manage own push tokens"
  on public.user_push_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Users insert own notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id);

-- Service role / edge functions use service key for push sends + cross-user inserts if needed.
-- Client sync inserts as authenticated user (own rows only).
