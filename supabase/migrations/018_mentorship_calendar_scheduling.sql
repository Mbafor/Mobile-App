-- Mentorship calendar scheduling: granular availability slots, session constraints,
-- booking/cancel RPCs, coach booking notifications, and 24h/1h session reminders.

-- ---------------------------------------------------------------------------
-- availability_slots (recurring weekly bookable windows per coach)
-- Maps to product spec "availability_slots"; coach_id = mentor user id.
-- ---------------------------------------------------------------------------
create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

create unique index if not exists availability_slots_coach_slot_unique
  on public.availability_slots (coach_id, day_of_week, start_time, end_time);

create index if not exists availability_slots_coach_idx
  on public.availability_slots (coach_id, day_of_week);

-- ---------------------------------------------------------------------------
-- Extend mentorship_sessions ("sessions" in product spec)
-- ---------------------------------------------------------------------------
alter table public.mentorship_sessions
  add column if not exists student_id uuid references auth.users (id) on delete cascade,
  add column if not exists coach_id uuid references auth.users (id) on delete cascade,
  add column if not exists joined_at timestamptz,
  add column if not exists ended_at timestamptz;

alter table public.mentorship_sessions drop constraint if exists mentorship_sessions_status_check;

alter table public.mentorship_sessions
  add constraint mentorship_sessions_status_check
  check (status in ('pending', 'proposed', 'confirmed', 'completed', 'cancelled'));

-- Backfill participant ids from mentorship
update public.mentorship_sessions s
set
  student_id = m.student_id,
  coach_id = m.mentor_id
from public.mentorships m
where m.id = s.mentorship_id
  and (s.student_id is null or s.coach_id is null);

-- Cancel duplicate active sessions so unique indexes can be applied safely
update public.mentorship_sessions dup
set
  status = 'cancelled',
  cancelled_at = coalesce(dup.cancelled_at, now()),
  cancel_reason = coalesce(dup.cancel_reason, 'Cancelled during calendar migration (duplicate booking)'),
  updated_at = now()
where dup.id in (
  select s.id
  from public.mentorship_sessions s
  where s.status in ('pending', 'proposed', 'confirmed')
    and s.student_id is not null
    and s.id not in (
      select distinct on (g.student_id) g.id
      from public.mentorship_sessions g
      where g.status in ('pending', 'proposed', 'confirmed')
        and g.student_id is not null
      order by g.student_id, g.scheduled_start asc, g.created_at asc
    )
);

update public.mentorship_sessions dup
set
  status = 'cancelled',
  cancelled_at = coalesce(dup.cancelled_at, now()),
  cancel_reason = coalesce(dup.cancel_reason, 'Cancelled during calendar migration (coach slot conflict)'),
  updated_at = now()
where dup.id in (
  select s.id
  from public.mentorship_sessions s
  where s.status in ('pending', 'proposed', 'confirmed')
    and s.coach_id is not null
    and s.id not in (
      select distinct on (g.coach_id, g.scheduled_start) g.id
      from public.mentorship_sessions g
      where g.status in ('pending', 'proposed', 'confirmed')
        and g.coach_id is not null
      order by g.coach_id, g.scheduled_start, g.created_at asc
    )
);

-- No double booking: one active session per coach per start time
create unique index if not exists mentorship_sessions_coach_start_unique
  on public.mentorship_sessions (coach_id, scheduled_start)
  where status in ('pending', 'proposed', 'confirmed')
    and coach_id is not null;

-- Student: at most one active session at a time
create unique index if not exists mentorship_sessions_one_upcoming_per_student
  on public.mentorship_sessions (student_id)
  where status in ('pending', 'proposed', 'confirmed')
    and student_id is not null;

-- ---------------------------------------------------------------------------
-- Sync student_id / coach_id on insert
-- ---------------------------------------------------------------------------
create or replace function public.mentorship_sessions_set_participants()
returns trigger
language plpgsql
as $$
declare
  v_mentor uuid;
  v_student uuid;
begin
  select m.mentor_id, m.student_id
  into v_mentor, v_student
  from public.mentorships m
  where m.id = new.mentorship_id;

  if v_mentor is null then
    raise exception 'invalid mentorship_id' using errcode = '23503';
  end if;

  new.coach_id := coalesce(new.coach_id, v_mentor);
  new.student_id := coalesce(new.student_id, v_student);
  return new;
end;
$$;

drop trigger if exists mentorship_sessions_set_participants on public.mentorship_sessions;
create trigger mentorship_sessions_set_participants
  before insert or update of mentorship_id on public.mentorship_sessions
  for each row execute function public.mentorship_sessions_set_participants();

-- ---------------------------------------------------------------------------
-- Auto-complete sessions after scheduled end
-- ---------------------------------------------------------------------------
create or replace function public.complete_past_mentorship_sessions()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  update public.mentorship_sessions
  set
    status = 'completed',
    ended_at = coalesce(ended_at, scheduled_end),
    updated_at = now()
  where status in ('pending', 'proposed', 'confirmed')
    and scheduled_end < now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.complete_past_mentorship_sessions() from public;
grant execute on function public.complete_past_mentorship_sessions() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Toggle availability slot (coach)
-- ---------------------------------------------------------------------------
create or replace function public.toggle_availability_slot(
  p_day_of_week smallint,
  p_start_time time,
  p_end_time time,
  p_timezone text default 'UTC'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach uuid := auth.uid();
  v_existing uuid;
begin
  if not public.current_user_is_approved_mentor() then
    raise exception 'only approved coaches can manage availability' using errcode = '42501';
  end if;

  if p_day_of_week < 0 or p_day_of_week > 6 or p_start_time >= p_end_time then
    raise exception 'invalid slot' using errcode = '22023';
  end if;

  select id into v_existing
  from public.availability_slots
  where coach_id = v_coach
    and day_of_week = p_day_of_week
    and start_time = p_start_time
    and end_time = p_end_time;

  if v_existing is not null then
    delete from public.availability_slots where id = v_existing;
    return jsonb_build_object('action', 'removed', 'id', v_existing);
  end if;

  insert into public.availability_slots (coach_id, day_of_week, start_time, end_time, timezone)
  values (v_coach, p_day_of_week, p_start_time, p_end_time, coalesce(nullif(trim(p_timezone), ''), 'UTC'))
  returning id into v_existing;

  return jsonb_build_object('action', 'added', 'id', v_existing);
end;
$$;

revoke all on function public.toggle_availability_slot(smallint, time, time, text) from public;
grant execute on function public.toggle_availability_slot(smallint, time, time, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Book session (student) — status pending, enforces rules
-- ---------------------------------------------------------------------------
create or replace function public.book_mentorship_session(
  p_mentorship_id uuid,
  p_scheduled_start timestamptz,
  p_scheduled_end timestamptz,
  p_timezone text default 'UTC',
  p_title text default 'Mentorship session',
  p_notes text default null
)
returns public.mentorship_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student uuid := auth.uid();
  v_coach uuid;
  v_session public.mentorship_sessions;
  v_upcoming int;
begin
  select m.mentor_id into v_coach
  from public.mentorships m
  where m.id = p_mentorship_id
    and m.student_id = v_student
    and m.status = 'active';

  if v_coach is null then
    raise exception 'not an active mentee on this mentorship' using errcode = '42501';
  end if;

  if p_scheduled_start >= p_scheduled_end or p_scheduled_start < now() then
    raise exception 'invalid session time' using errcode = '22023';
  end if;

  select count(*)::int into v_upcoming
  from public.mentorship_sessions s
  where s.student_id = v_student
    and s.status in ('pending', 'proposed', 'confirmed')
    and s.scheduled_end > now();

  if v_upcoming > 0 then
    raise exception 'you already have an upcoming session' using errcode = '23505';
  end if;

  if not exists (
    select 1
    from public.availability_slots a
    where a.coach_id = v_coach
      and a.day_of_week = extract(
        dow from p_scheduled_start at time zone coalesce(nullif(trim(p_timezone), ''), 'UTC')
      )::smallint
      and a.start_time = (p_scheduled_start at time zone coalesce(nullif(trim(p_timezone), ''), 'UTC'))::time
      and a.end_time = (p_scheduled_end at time zone coalesce(nullif(trim(p_timezone), ''), 'UTC'))::time
  ) then
    raise exception 'selected time is not within coach availability' using errcode = '22023';
  end if;

  insert into public.mentorship_sessions (
    mentorship_id,
    created_by,
    student_id,
    coach_id,
    scheduled_start,
    scheduled_end,
    timezone,
    status,
    title,
    notes
  )
  values (
    p_mentorship_id,
    v_student,
    v_student,
    v_coach,
    p_scheduled_start,
    p_scheduled_end,
    coalesce(nullif(trim(p_timezone), ''), 'UTC'),
    'pending',
    coalesce(nullif(trim(p_title), ''), 'Mentorship session'),
    nullif(trim(p_notes), '')
  )
  returning * into v_session;

  return v_session;
end;
$$;

revoke all on function public.book_mentorship_session(uuid, timestamptz, timestamptz, text, text, text) from public;
grant execute on function public.book_mentorship_session(uuid, timestamptz, timestamptz, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Cancel session with 24h rule for students
-- ---------------------------------------------------------------------------
create or replace function public.cancel_mentorship_session(
  p_session_id uuid,
  p_reason text default 'Cancelled'
)
returns public.mentorship_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.mentorship_sessions;
  v_is_coach boolean;
begin
  select * into v_row
  from public.mentorship_sessions
  where id = p_session_id;

  if v_row.id is null then
    raise exception 'session not found' using errcode = 'P0002';
  end if;

  v_is_coach := v_uid = v_row.coach_id;

  if v_uid <> v_row.student_id and not v_is_coach then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  if not v_is_coach and v_row.scheduled_start <= now() + interval '24 hours' then
    raise exception 'sessions can only be cancelled at least 24 hours in advance'
      using errcode = '22023';
  end if;

  if v_row.status in ('completed', 'cancelled') then
    raise exception 'session cannot be cancelled' using errcode = '22023';
  end if;

  update public.mentorship_sessions
  set
    status = 'cancelled',
    cancelled_at = now(),
    cancel_reason = coalesce(nullif(trim(p_reason), ''), 'Cancelled'),
    updated_at = now()
  where id = p_session_id
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.cancel_mentorship_session(uuid, text) from public;
grant execute on function public.cancel_mentorship_session(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Coach notification when student books
-- ---------------------------------------------------------------------------
alter table public.notifications drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check check (type in (
    'new_match',
    'deadline_reminder',
    'saved_reminder',
    'mentor_assigned',
    'mentee_assigned',
    'waiting_list_update',
    'session_reminder',
    'session_booked',
    'mentorship_message',
    'mentor_broadcast'
  ));

create or replace function public.notify_coach_session_booked()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_name text;
begin
  if new.status not in ('pending', 'proposed') or new.created_by <> new.student_id then
    return new;
  end if;

  select coalesce(nullif(trim(p.full_name), ''), 'A student')
  into v_student_name
  from public.profiles p
  where p.id = new.student_id;

  perform public.create_app_notification(
    new.coach_id,
    'session_booked',
    'New session booking',
    format('%s booked a session on %s.',
      v_student_name,
      to_char(new.scheduled_start, 'Dy Mon DD at HH24:MI')),
    'session_booked:' || new.id::text,
    null,
    jsonb_build_object(
      'session_id', new.id,
      'mentorship_id', new.mentorship_id,
      'student_id', new.student_id
    )
  );

  return new;
end;
$$;

drop trigger if exists mentorship_sessions_notify_booked on public.mentorship_sessions;
create trigger mentorship_sessions_notify_booked
  after insert on public.mentorship_sessions
  for each row execute function public.notify_coach_session_booked();

create or replace function public.notify_student_session_cancelled()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'cancelled' and old.status is distinct from 'cancelled' and new.cancelled_at is not null then
    if new.cancel_reason ilike '%coach%' or auth.uid() = new.coach_id then
      perform public.create_app_notification(
        new.student_id,
        'session_booked',
        'Session cancelled',
        format('Your session on %s was cancelled by your coach.',
          to_char(new.scheduled_start, 'Dy Mon DD at HH24:MI')),
        'session_cancelled:student:' || new.id::text,
        null,
        jsonb_build_object('session_id', new.id, 'mentorship_id', new.mentorship_id)
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists mentorship_sessions_notify_cancelled on public.mentorship_sessions;
create trigger mentorship_sessions_notify_cancelled
  after update on public.mentorship_sessions
  for each row execute function public.notify_student_session_cancelled();

-- ---------------------------------------------------------------------------
-- Session reminders: 24 hours and 1 hour before start
-- ---------------------------------------------------------------------------
create or replace function public.send_session_reminder_notifications()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
  v_count int := 0;
  v_window text;
begin
  perform public.complete_past_mentorship_sessions();

  for v_window in select unnest(array['24h', '1h'])
  loop
    for v_row in
      select
        s.id as session_id,
        s.mentorship_id,
        s.scheduled_start,
        s.title,
        m.mentor_id,
        m.student_id
      from public.mentorship_sessions s
      join public.mentorships m on m.id = s.mentorship_id
      where s.status in ('pending', 'proposed', 'confirmed')
        and s.scheduled_start > now()
        and (
          (v_window = '24h'
            and s.scheduled_start <= now() + interval '24 hours'
            and s.scheduled_start > now() + interval '23 hours')
          or (v_window = '1h'
            and s.scheduled_start <= now() + interval '1 hour'
            and s.scheduled_start > now() + interval '45 minutes')
        )
    loop
      perform public.create_app_notification(
        v_row.student_id,
        'session_reminder',
        case when v_window = '24h' then 'Session in 24 hours' else 'Session in 1 hour' end,
        format('"%s" starts %s.',
          coalesce(v_row.title, 'Mentorship session'),
          to_char(v_row.scheduled_start, 'Mon DD at HH24:MI')),
        'session_reminder:student:' || v_window || ':' || v_row.session_id::text,
        null,
        jsonb_build_object(
          'session_id', v_row.session_id,
          'mentorship_id', v_row.mentorship_id,
          'reminder_window', v_window
        )
      );
      perform public.create_app_notification(
        v_row.mentor_id,
        'session_reminder',
        case when v_window = '24h' then 'Session in 24 hours' else 'Session in 1 hour' end,
        format('"%s" starts %s.',
          coalesce(v_row.title, 'Mentorship session'),
          to_char(v_row.scheduled_start, 'Mon DD at HH24:MI')),
        'session_reminder:mentor:' || v_window || ':' || v_row.session_id::text,
        null,
        jsonb_build_object(
          'session_id', v_row.session_id,
          'mentorship_id', v_row.mentorship_id,
          'reminder_window', v_window
        )
      );
      v_count := v_count + 2;
    end loop;
  end loop;

  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS: availability_slots
-- ---------------------------------------------------------------------------
alter table public.availability_slots enable row level security;

create policy "Coaches manage own availability slots"
  on public.availability_slots for all
  using (
    auth.uid() = coach_id
    and public.current_user_is_approved_mentor()
  )
  with check (
    auth.uid() = coach_id
    and public.current_user_is_approved_mentor()
  );

create policy "Mentees read coach availability slots"
  on public.availability_slots for select
  using (
    exists (
      select 1
      from public.mentorships m
      where m.mentor_id = availability_slots.coach_id
        and m.student_id = auth.uid()
        and m.status = 'active'
    )
    or auth.uid() = coach_id
    or public.current_user_is_admin()
  );

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.availability_slots;

-- session_booked respects session_reminders preference
create or replace function public.should_send_notification(
  p_user_id uuid,
  p_type text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select case
        when not np.push_enabled then false
        when p_type = 'new_match' then np.new_matches
        when p_type = 'deadline_reminder' then np.deadline_reminders
        when p_type = 'saved_reminder' then np.saved_reminders
        when p_type in ('mentor_assigned', 'mentee_assigned') then np.mentorship_assignments
        when p_type = 'waiting_list_update' then np.waiting_list_updates
        when p_type in ('session_reminder', 'session_booked') then np.session_reminders
        when p_type = 'mentorship_message' then np.mentorship_messages
        when p_type = 'mentor_broadcast' then true
        else true
      end
      from public.notification_preferences np
      where np.user_id = p_user_id
    ),
    true
  );
$$;
