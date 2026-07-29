-- Adds events.image_url to both reminder-batch RPCs so reminder emails can
-- show the event's cover image (product request: "they should all have the
-- image of the event"). Pure additive column on the existing return tables --
-- same query bodies as 055/056, just one more selected column each.
--
-- Postgres won't let CREATE OR REPLACE change a function's OUT parameter
-- list (adding a column to `returns table (...)` counts as a return-type
-- change), so both functions need an explicit drop first, same as
-- 044_deadline_reminder_profile_match.sql did for get_deadline_reminders().

drop function if exists public.get_event_reminder_batch(integer);
drop function if exists public.get_event_reminder_batch_minutes(integer);

create function public.get_event_reminder_batch(p_days_ahead integer)
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
  image_url text,
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
    e.image_url,
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

create function public.get_event_reminder_batch_minutes(p_minutes_ahead integer)
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
  image_url text,
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
    e.image_url,
    case when p_minutes_ahead = 60 then '1hr' else '30min' end as reminder_kind
  from public.event_registrations r
  join target_events e on e.id = r.event_id
  where (p_minutes_ahead = 60 and r.reminder_1hr_sent = false)
     or (p_minutes_ahead = 30 and r.reminder_30min_sent = false);
$$;

revoke all on function public.get_event_reminder_batch(integer) from public;
grant execute on function public.get_event_reminder_batch(integer) to service_role;

revoke all on function public.get_event_reminder_batch_minutes(integer) from public;
grant execute on function public.get_event_reminder_batch_minutes(integer) to service_role;
