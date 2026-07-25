-- Native event registration (voila-africa.com/events) — extends 053_events with
-- slug-based public pages, in-app registration, and reminder flags.

-- ---------------------------------------------------------------------------
-- Extend events
-- ---------------------------------------------------------------------------
alter table public.events
  add column if not exists slug text,
  add column if not exists tagline text,
  add column if not exists takeaways text[] not null default '{}',
  add column if not exists host_name text,
  add column if not exists host_bio text,
  add column if not exists end_time timestamptz,
  add column if not exists timezone text not null default 'GMT',
  add column if not exists location_platform text,
  add column if not exists meeting_link text,
  add column if not exists capacity integer check (capacity is null or capacity > 0);

-- Backfill slug for existing rows
update public.events e
set slug = lower(regexp_replace(trim(e.title), '[^a-zA-Z0-9]+', '-', 'g'))
  || '-'
  || left(replace(e.id::text, '-', ''), 8)
where e.slug is null;

-- Backfill end_time (default 1h after start)
update public.events
set end_time = event_date + interval '1 hour'
where end_time is null;

-- Backfill location_platform from legacy column
update public.events
set location_platform = location_or_link
where location_platform is null and location_or_link is not null;

-- Online events: store join link separately when only legacy field exists
update public.events
set meeting_link = location_or_link
where meeting_link is null
  and location_type in ('virtual', 'online')
  and location_or_link is not null;

alter table public.events
  alter column slug set not null;

create unique index if not exists idx_events_slug on public.events (slug);

-- Allow native registration pages without an external register_link
alter table public.events
  alter column register_link drop not null;

-- ---------------------------------------------------------------------------
-- Registrations
-- ---------------------------------------------------------------------------
create table if not exists public.event_registrations (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid not null references public.events (id) on delete cascade,
  full_name           text not null,
  email               text not null,
  whatsapp            text,
  is_existing_user    boolean not null default false,
  registration_ref    text not null unique,
  created_at          timestamptz not null default now(),
  reminder_3day_sent  boolean not null default false,
  reminder_1day_sent  boolean not null default false
);

create index if not exists idx_event_registrations_event on public.event_registrations (event_id);
create index if not exists idx_event_registrations_email on public.event_registrations (lower(email));
create unique index if not exists idx_event_registrations_event_email
  on public.event_registrations (event_id, lower(email));

alter table public.event_registrations enable row level security;

-- Admins / event managers can read all registrations
create policy "Admins can read event registrations"
  on public.event_registrations for select
  to authenticated
  using (public.current_user_can_manage_events());

-- Partners can read registrations for their own events
create policy "Partners can read own event registrations"
  on public.event_registrations for select
  to authenticated
  using (public.current_partner_owns_event(event_id));

-- Inserts go through service role (Next.js API) — no public insert policy

-- ---------------------------------------------------------------------------
-- Registration count (public capacity display via service role / RPC)
-- ---------------------------------------------------------------------------
create or replace function public.get_event_registration_count(p_event_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.event_registrations where event_id = p_event_id;
$$;

revoke all on function public.get_event_registration_count(uuid) from public;
grant execute on function public.get_event_registration_count(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Pending reminders (called by cron edge/API with service role)
-- ---------------------------------------------------------------------------
create or replace function public.get_event_reminder_batch(p_days_ahead integer)
returns table (
  registration_id uuid,
  event_id uuid,
  full_name text,
  email text,
  event_title text,
  event_slug text,
  start_time timestamptz,
  end_time timestamptz,
  timezone text,
  location_type text,
  location_platform text,
  meeting_link text,
  reminder_kind text
)
language sql
stable
security definer
set search_path = public
as $$
  with target_events as (
    select e.*
    from public.events e
    where e.status = 'upcoming'
      and e.event_date::date = (current_date + make_interval(days => p_days_ahead))
  )
  select
    r.id as registration_id,
    r.event_id,
    r.full_name,
    r.email,
    e.title as event_title,
    e.slug as event_slug,
    e.event_date as start_time,
    e.end_time,
    e.timezone,
    e.location_type,
    coalesce(e.location_platform, e.location_or_link) as location_platform,
    e.meeting_link,
    case when p_days_ahead = 3 then '3day' else '1day' end as reminder_kind
  from public.event_registrations r
  join target_events e on e.id = r.event_id
  where (p_days_ahead = 3 and r.reminder_3day_sent = false)
     or (p_days_ahead = 1 and r.reminder_1day_sent = false);
$$;

revoke all on function public.get_event_reminder_batch(integer) from public;
grant execute on function public.get_event_reminder_batch(integer) to service_role;

create or replace function public.mark_event_reminder_sent(
  p_registration_ids uuid[],
  p_kind text
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.event_registrations
  set
    reminder_3day_sent = case when p_kind = '3day' then true else reminder_3day_sent end,
    reminder_1day_sent = case when p_kind = '1day' then true else reminder_1day_sent end
  where id = any(p_registration_ids);
$$;

revoke all on function public.mark_event_reminder_sent(uuid[], text) from public;
grant execute on function public.mark_event_reminder_sent(uuid[], text) to service_role;
