-- Events: partner/admin-published events (webinars, info sessions, career
-- fairs). Same trust model as opportunities -- no approval queue, publishes
-- immediately. Modeled closely on opportunities/partner_posts, with one
-- deliberate difference: ownership is a direct owner_type/owner_id pair on
-- the row itself rather than a separate join table, since (unlike
-- opportunities) every event has exactly one owner and there's no
-- digest-bundling scenario to support. owner_id carries no DB-level FK
-- (Postgres can't conditionally reference two different tables), so
-- ownership is enforced entirely via the RLS helper functions below --
-- same technique current_partner_owns_opportunity() already uses.

create table public.events (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  description       text not null,
  event_date        timestamptz not null,
  location_type     text not null default 'virtual' check (location_type in ('virtual', 'in_person')),
  location_or_link  text,
  register_link     text not null,
  image_url         text,
  category          text,
  owner_type        text not null check (owner_type in ('partner', 'admin')),
  owner_id          uuid not null,
  status            text not null default 'upcoming' check (status in ('upcoming', 'past', 'cancelled')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create index idx_events_event_date on public.events (event_date);
create index idx_events_category on public.events (category) where category is not null;
create index idx_events_owner on public.events (owner_type, owner_id);

alter table public.events enable row level security;

-- ---------------------------------------------------------------------------
-- Read: same "publish immediately" pool as opportunities -- everyone
-- (anon + authenticated) can read any non-cancelled event. Upcoming vs. past
-- is a query-time filter on event_date, not a status value (see app code).
-- ---------------------------------------------------------------------------
create policy "Anyone can read non-cancelled events"
  on public.events for select
  to anon, authenticated
  using (status <> 'cancelled');

-- ---------------------------------------------------------------------------
-- Partner ownership: mirrors current_partner_owns_opportunity(), but events
-- carry owner_type/owner_id directly instead of needing a join-table lookup.
-- ---------------------------------------------------------------------------
create or replace function public.current_partner_owns_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.events
    where id = p_event_id
      and owner_type = 'partner'
      and owner_id = public.current_partner_id()
  );
$$;

revoke all on function public.current_partner_owns_event(uuid) from public;
grant execute on function public.current_partner_owns_event(uuid) to authenticated;

create policy "Partners can insert own events"
  on public.events for insert
  to authenticated
  with check (owner_type = 'partner' and owner_id = public.current_partner_id());

create policy "Partners can update own events"
  on public.events for update
  to authenticated
  using (public.current_partner_owns_event(id))
  with check (public.current_partner_owns_event(id));

create policy "Partners can delete own events"
  on public.events for delete
  to authenticated
  using (public.current_partner_owns_event(id));

-- ---------------------------------------------------------------------------
-- Admin/super-admin: full CRUD over every event regardless of owner.
-- Mirrors current_user_can_manage_opportunities().
-- ---------------------------------------------------------------------------
create or replace function public.current_user_can_manage_events()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_is_admin() or public.current_user_is_super_admin();
$$;

revoke all on function public.current_user_can_manage_events() from public;
grant execute on function public.current_user_can_manage_events() to authenticated;

create policy "Admins can read all events"
  on public.events for select
  to authenticated
  using (public.current_user_can_manage_events());

create policy "Admins can insert events"
  on public.events for insert
  to authenticated
  with check (public.current_user_can_manage_events());

create policy "Admins can update events"
  on public.events for update
  to authenticated
  using (public.current_user_can_manage_events())
  with check (public.current_user_can_manage_events());

create policy "Admins can delete events"
  on public.events for delete
  to authenticated
  using (public.current_user_can_manage_events());

-- ---------------------------------------------------------------------------
-- event-images: public storage bucket, per-uploader folder policies.
-- Copied from 009_profile_avatars.sql's pattern; works for both partner and
-- admin uploaders since both are real auth.users rows with a real auth.uid().
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do update set public = true;

create policy "Event images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'event-images');

create policy "Users can upload their own event images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own event images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own event images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- event_link_clicks: attribution log for /e/[id]?ref=... hits. Written only
-- by the bridge page route using the service role key. Kept as its own
-- table rather than overloading link_clicks (048_partner_program.sql),
-- since link_clicks' existing partner-analytics queries assume
-- opportunity_id only.
-- ---------------------------------------------------------------------------
create table public.event_link_clicks (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid references public.events (id) on delete set null,
  ref_code   text,
  clicked_at timestamptz not null default now()
);

create index idx_event_link_clicks_ref_code on public.event_link_clicks (ref_code);
create index idx_event_link_clicks_event on public.event_link_clicks (event_id);

alter table public.event_link_clicks enable row level security;

create policy "Partners read own event clicks"
  on public.event_link_clicks for select
  to authenticated
  using (ref_code = public.current_partner_ref_code());

-- No insert policy for authenticated/anon: only the service-role bridge route writes.
