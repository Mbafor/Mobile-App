-- 028_mentorship_edge_cases.sql
-- 1. Cascade mentorship endings/expirations to upcoming calendar sessions.
-- 2. Prevent booking calendar sessions past the mentorship's 3-month ends_at date.
-- 3. Add a fallback matching algorithm for when no mentor has a compatibility score >= 1.

-- ---------------------------------------------------------------------------
-- 1. Cascade Mentorship Expiration/Ending to Sessions
-- ---------------------------------------------------------------------------
create or replace function public.mentorship_status_cascade_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- If mentorship status changes from 'active' to anything else (ended, expired, left, removed)
  if tg_op = 'UPDATE' and old.status = 'active' and new.status <> 'active' then
    update public.mentorship_sessions
    set
      status = 'cancelled',
      cancelled_at = coalesce(cancelled_at, now()),
      cancel_reason = coalesce(
        nullif(trim(cancel_reason), ''), 
        'Mentorship has ended or expired'
      ),
      updated_at = now()
    where mentorship_id = new.id
      and status in ('pending', 'proposed', 'confirmed');
  end if;
  return new;
end;
$$;

drop trigger if exists mentorship_status_cascade on public.mentorships;
create trigger mentorship_status_cascade
  after update on public.mentorships
  for each row execute function public.mentorship_status_cascade_trigger();

-- ---------------------------------------------------------------------------
-- 2. Prevent Booking Sessions Past Expiration
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
  v_ends_at timestamptz;
  v_session public.mentorship_sessions;
  v_upcoming int;
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

-- ---------------------------------------------------------------------------
-- 3. Match Algorithm Fallback (Assign generic coach if no score >= 1)
-- ---------------------------------------------------------------------------
create or replace function public.request_mentorship_coach(
  p_match_snapshot jsonb,
  p_requested_mentor_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid := auth.uid();
  v_request_id uuid;
  v_active_count int;
  v_mentor_id uuid;
  v_best_score numeric := -1;
  v_score numeric;
  r record;
begin
  if v_student_id is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select count(*)::int into v_active_count
  from public.mentorships
  where student_id = v_student_id
    and status = 'active';

  if v_active_count > 0 then
    raise exception 'Student already has an active mentorship' using errcode = 'P0009';
  end if;

  insert into public.mentorship_requests (student_id, status, requested_mentor_id, match_snapshot)
  values (v_student_id, 'pending', p_requested_mentor_id, coalesce(p_match_snapshot, '{}'::jsonb))
  returning id into v_request_id;

  if p_requested_mentor_id is not null then
    if not public.mentor_has_capacity(p_requested_mentor_id) then
      return public.enqueue_mentorship_request(v_request_id);
    end if;

    if public.is_mentor_compatible(v_student_id, p_requested_mentor_id, 0) then
      v_best_score := public.mentorship_match_score(v_student_id, p_requested_mentor_id);
      return public.fulfill_mentorship_request(
        v_request_id,
        v_student_id,
        p_requested_mentor_id,
        v_best_score
      );
    else
      -- Direct request but zero compatibility or unapproved mentor -> just let them queue or ignore?
      -- If mentor explicitly requested but not compatible, queue them.
      return public.enqueue_mentorship_request(v_request_id);
    end if;
  end if;

  for r in
    select mp.user_id as mentor_id
    from public.mentor_profiles mp
    where mp.status = 'approved'
      and mp.is_accepting_students
  loop
    v_score := public.mentorship_match_score(v_student_id, r.mentor_id);

    if v_score >= 1 and public.mentor_has_capacity(r.mentor_id) then
      if v_score > v_best_score then
        v_best_score := v_score;
        v_mentor_id := r.mentor_id;
      end if;
    end if;
  end loop;

  -- FALLBACK: If no compatible mentor found (score < 1), but there are mentors with capacity,
  -- assign to the one with the most capacity (fewest active students).
  if v_mentor_id is null then
    select mp.user_id into v_mentor_id
    from public.mentor_profiles mp
    where mp.status = 'approved'
      and mp.is_accepting_students
      and public.mentor_has_capacity(mp.user_id)
    order by public.mentor_active_mentee_count(mp.user_id) asc
    limit 1;
    
    if v_mentor_id is not null then
      v_best_score := 0; -- Mark as fallback match
    end if;
  end if;

  if v_mentor_id is not null then
    return public.fulfill_mentorship_request(
      v_request_id,
      v_student_id,
      v_mentor_id,
      v_best_score
    );
  end if;

  return public.enqueue_mentorship_request(v_request_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Queue Processor Fallback (Prioritize compatible, fallback to oldest)
-- ---------------------------------------------------------------------------
create or replace function public.process_mentor_waiting_queue(p_mentor_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assigned int := 0;
  v_entry record;
  v_score numeric;
  v_result jsonb;
  v_fallback_entry record;
begin
  if not exists (
    select 1 from public.mentor_profiles mp
    where mp.user_id = p_mentor_id
      and mp.status = 'approved'
      and mp.is_accepting_students
  ) then
    return 0;
  end if;

  -- First Pass: Look for compatible students (score >= 1)
  for v_entry in
    select wl.id as wait_id, wl.request_id, wl.student_id, mr.requested_mentor_id
    from public.mentorship_waiting_list wl
    join public.mentorship_requests mr on mr.id = wl.request_id
    where mr.status = 'waiting_list'
    order by wl.priority desc, wl.entered_at asc
  loop
    exit when not public.mentor_has_capacity(p_mentor_id);

    if v_entry.requested_mentor_id is not null and v_entry.requested_mentor_id <> p_mentor_id then
      continue;
    end if;

    if exists (select 1 from public.mentorships m where m.student_id = v_entry.student_id and m.status = 'active') then
      update public.mentorship_requests set status = 'cancelled', cancelled_at = now(), cancel_reason = 'Student already has active mentorship', updated_at = now() where id = v_entry.request_id;
      delete from public.mentorship_waiting_list where id = v_entry.wait_id;
      continue;
    end if;

    v_score := public.mentorship_match_score(v_entry.student_id, p_mentor_id);

    if v_score >= 1 then
      v_result := public.fulfill_mentorship_request(v_entry.request_id, v_entry.student_id, p_mentor_id, v_score);
      if v_result is not null then
        v_assigned := v_assigned + 1;
      end if;
    elsif v_fallback_entry is null then
      -- Save the absolutely oldest person we saw for the second pass
      v_fallback_entry := v_entry;
    end if;
  end loop;

  -- Second Pass: Fallback. If we still have capacity, take the oldest waiting student regardless of score
  if public.mentor_has_capacity(p_mentor_id) and v_fallback_entry is not null then
    -- Verify they haven't been assigned by a concurrent transaction
    if exists (select 1 from public.mentorship_waiting_list where id = v_fallback_entry.wait_id) then
      v_result := public.fulfill_mentorship_request(v_fallback_entry.request_id, v_fallback_entry.student_id, p_mentor_id, 0);
      if v_result is not null then
        v_assigned := v_assigned + 1;
      end if;
    end if;
  end if;

  return v_assigned;
end;
$$;
