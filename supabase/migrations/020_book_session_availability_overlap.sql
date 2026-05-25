-- Allow booking when the scheduled instant falls within a coach availability window
-- (uses each slot's timezone), not only exact start/end time equality.

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

  if p_scheduled_end - p_scheduled_start <> interval '30 minutes' then
    raise exception 'sessions must be 30 minutes' using errcode = '22023';
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
        dow from p_scheduled_start at time zone a.timezone
      )::smallint
      and (p_scheduled_start at time zone a.timezone)::time >= a.start_time
      and (p_scheduled_start at time zone a.timezone)::time < a.end_time
      and (p_scheduled_end at time zone a.timezone)::time <= a.end_time
  ) then
    raise exception 'selected time is not within coach availability' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.mentorship_sessions s
    where s.coach_id = v_coach
      and s.status in ('pending', 'proposed', 'confirmed')
      and s.scheduled_start < p_scheduled_end
      and s.scheduled_end > p_scheduled_start
  ) then
    raise exception 'this time slot is already booked' using errcode = '23505';
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
