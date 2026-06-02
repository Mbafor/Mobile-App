-- Replace Google Meet/Calendar session flow with automatic Jitsi links.
-- Keep booking/confirmation workflow unchanged while ensuring a join link exists immediately.

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
  v_ends_at timestamptz;
  v_session public.mentorship_sessions;
  v_upcoming int;
  v_session_id uuid := gen_random_uuid();
  v_meeting_url text := format('https://meet.jit.si/voila-session-%s', v_session_id::text);
begin
  select m.mentor_id, m.ends_at into v_coach, v_ends_at
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

  if p_scheduled_start > coalesce(v_ends_at, now() + interval '3 months') then
    raise exception 'cannot book a session past the mentorship end date' using errcode = '22023';
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
    id,
    mentorship_id,
    created_by,
    student_id,
    coach_id,
    scheduled_start,
    scheduled_end,
    timezone,
    status,
    title,
    notes,
    meeting_url
  )
  values (
    v_session_id,
    p_mentorship_id,
    v_student,
    v_student,
    v_coach,
    p_scheduled_start,
    p_scheduled_end,
    coalesce(nullif(trim(p_timezone), ''), 'UTC'),
    'pending',
    coalesce(nullif(trim(p_title), ''), 'Mentorship session'),
    nullif(trim(p_notes), ''),
    v_meeting_url
  )
  returning * into v_session;

  return v_session;
end;
$$;

create or replace function public.notify_session_booked()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_name text;
  v_coach_name text;
begin
  if new.status not in ('pending', 'proposed') or new.created_by <> new.student_id then
    return new;
  end if;

  select coalesce(nullif(trim(p.full_name), ''), 'A student')
  into v_student_name
  from public.profiles p
  where p.id = new.student_id;

  select coalesce(nullif(trim(p.full_name), ''), 'Your coach')
  into v_coach_name
  from public.profiles p
  where p.id = new.coach_id;

  perform public.create_app_notification(
    new.coach_id,
    'session_booked',
    'New session booking',
    format('%s booked a session on %s.',
      v_student_name,
      to_char(new.scheduled_start, 'Dy Mon DD at HH24:MI')),
    'session_booked:coach:' || new.id::text,
    null,
    jsonb_build_object(
      'session_id', new.id,
      'mentorship_id', new.mentorship_id,
      'student_id', new.student_id,
      'meeting_url', new.meeting_url
    )
  );

  perform public.create_app_notification(
    new.student_id,
    'session_booked',
    'Booking received',
    format('Your session request with %s on %s has been sent. The join link is ready.',
      v_coach_name,
      to_char(new.scheduled_start, 'Dy Mon DD at HH24:MI')),
    'session_booked:student:' || new.id::text,
    null,
    jsonb_build_object(
      'session_id', new.id,
      'mentorship_id', new.mentorship_id,
      'coach_id', new.coach_id,
      'meeting_url', new.meeting_url
    )
  );

  return new;
end;
$$;

create or replace function public.notify_session_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'confirmed'
    and old.status is distinct from 'confirmed'
    and new.meeting_url is not null
  then
    perform public.create_app_notification(
      new.student_id,
      'session_booked',
      'Session confirmed',
      format('Your session on %s is confirmed. Tap to open the session link.',
        to_char(new.scheduled_start, 'Dy Mon DD at HH24:MI')),
      'session_confirmed:student:' || new.id::text,
      null,
      jsonb_build_object(
        'session_id', new.id,
        'mentorship_id', new.mentorship_id,
        'meeting_url', new.meeting_url
      )
    );

    perform public.create_app_notification(
      new.coach_id,
      'session_booked',
      'Session confirmed',
      format('Your session on %s is confirmed. Session link is ready.',
        to_char(new.scheduled_start, 'Dy Mon DD at HH24:MI')),
      'session_confirmed:coach:' || new.id::text,
      null,
      jsonb_build_object(
        'session_id', new.id,
        'mentorship_id', new.mentorship_id,
        'meeting_url', new.meeting_url
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists mentorship_sessions_notify_booked on public.mentorship_sessions;
create trigger mentorship_sessions_notify_booked
  after insert on public.mentorship_sessions
  for each row execute function public.notify_session_booked();

drop trigger if exists mentorship_sessions_notify_confirmed on public.mentorship_sessions;
create trigger mentorship_sessions_notify_confirmed
  after update on public.mentorship_sessions
  for each row execute function public.notify_session_confirmed();

grant execute on function public.book_mentorship_session(uuid, timestamptz, timestamptz, text, text, text) to authenticated;
grant execute on function public.confirm_mentorship_session(uuid, text) to authenticated;
