-- Adds day-of, 1-hour, and 30-minute event reminders alongside the existing
-- 3-day/1-day ones from 055_event_registrations.sql. The original
-- get_event_reminder_batch(p_days_ahead) matches by calendar-date equality,
-- which only makes sense when checked once a day. Hour/minute reminders need
-- a much more frequent cron and a "time remaining is at or under the
-- threshold, event hasn't started yet" comparison instead -- that way a
-- reminder is guaranteed to fire on whichever cron run first crosses the
-- threshold, regardless of the exact run cadence, and the *_sent flag
-- prevents it firing twice on overlapping runs.

alter table public.event_registrations
  add column if not exists reminder_dayof_sent boolean not null default false,
  add column if not exists reminder_1hr_sent boolean not null default false,
  add column if not exists reminder_30min_sent boolean not null default false;

-- Extend the existing day-based batch fn to also support p_days_ahead = 0
-- ("day of event" -- event_date falls on today's calendar date).
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
    case
      when p_days_ahead = 3 then '3day'
      when p_days_ahead = 1 then '1day'
      else 'dayof'
    end as reminder_kind
  from public.event_registrations r
  join target_events e on e.id = r.event_id
  where (p_days_ahead = 3 and r.reminder_3day_sent = false)
     or (p_days_ahead = 1 and r.reminder_1day_sent = false)
     or (p_days_ahead = 0 and r.reminder_dayof_sent = false);
$$;

-- New: minute-granularity batch for the 1hr/30min reminders. Safe to call
-- every few minutes -- matches anything inside the threshold that hasn't
-- started yet and hasn't already been sent.
create or replace function public.get_event_reminder_batch_minutes(p_minutes_ahead integer)
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
      and e.event_date > now()
      and e.event_date <= now() + make_interval(mins => p_minutes_ahead)
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
    case when p_minutes_ahead = 60 then '1hr' else '30min' end as reminder_kind
  from public.event_registrations r
  join target_events e on e.id = r.event_id
  where (p_minutes_ahead = 60 and r.reminder_1hr_sent = false)
     or (p_minutes_ahead = 30 and r.reminder_30min_sent = false);
$$;

revoke all on function public.get_event_reminder_batch_minutes(integer) from public;
grant execute on function public.get_event_reminder_batch_minutes(integer) to service_role;

-- Extend mark_event_reminder_sent to cover the three new kinds.
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
    reminder_1day_sent = case when p_kind = '1day' then true else reminder_1day_sent end,
    reminder_dayof_sent = case when p_kind = 'dayof' then true else reminder_dayof_sent end,
    reminder_1hr_sent = case when p_kind = '1hr' then true else reminder_1hr_sent end,
    reminder_30min_sent = case when p_kind = '30min' then true else reminder_30min_sent end
  where id = any(p_registration_ids);
$$;
