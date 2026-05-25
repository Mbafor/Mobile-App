-- Mentorship assignment: request, queue, auto-assign on slot open, expiration maintenance.
-- All mutations run through security definer RPCs (bypass RLS safely).

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.mentor_has_capacity(p_mentor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select public.mentor_active_mentee_count(p_mentor_id) < mp.max_students
      from public.mentor_profiles mp
      where mp.user_id = p_mentor_id
        and mp.status = 'approved'
        and mp.is_accepting_students
    ),
    false
  );
$$;

create or replace function public.is_mentor_compatible(
  p_student_id uuid,
  p_mentor_id uuid,
  p_min_score numeric default 1
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.mentorship_match_score(p_student_id, p_mentor_id) >= p_min_score;
$$;

-- ---------------------------------------------------------------------------
-- Fulfill a request → active mentorship (internal)
-- ---------------------------------------------------------------------------
create or replace function public.fulfill_mentorship_request(
  p_request_id uuid,
  p_student_id uuid,
  p_mentor_id uuid,
  p_match_score numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mentorship_id uuid;
begin
  if not public.mentor_has_capacity(p_mentor_id) then
    raise exception 'mentor has no available slots' using errcode = 'P0007';
  end if;

  if not public.is_mentor_compatible(p_student_id, p_mentor_id) then
    raise exception 'mentor is not compatible with student' using errcode = 'P0008';
  end if;

  insert into public.mentorships (mentor_id, student_id, request_id, status)
  values (p_mentor_id, p_student_id, p_request_id, 'active')
  returning id into v_mentorship_id;

  update public.mentorship_requests
  set
    status = 'matched',
    matched_mentor_id = p_mentor_id,
    matched_at = now(),
    mentorship_id = v_mentorship_id,
    match_score = p_match_score,
    updated_at = now()
  where id = p_request_id;

  delete from public.mentorship_waiting_list
  where request_id = p_request_id;

  return jsonb_build_object(
    'outcome', 'matched',
    'request_id', p_request_id,
    'mentorship_id', v_mentorship_id,
    'mentor_id', p_mentor_id,
    'match_score', p_match_score
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Enqueue when no compatible coach with capacity
-- ---------------------------------------------------------------------------
create or replace function public.enqueue_mentorship_request(
  p_request_id uuid,
  p_student_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_position bigint;
begin
  update public.mentorship_requests
  set status = 'waiting_list', updated_at = now()
  where id = p_request_id
    and student_id = p_student_id;

  insert into public.mentorship_waiting_list (request_id, student_id)
  values (p_request_id, p_student_id)
  on conflict (request_id) do nothing;

  select count(*) into v_position
  from public.mentorship_waiting_list wl
  where wl.entered_at <= (
    select entered_at from public.mentorship_waiting_list where request_id = p_request_id
  );

  return jsonb_build_object(
    'outcome', 'waiting_list',
    'request_id', p_request_id,
    'queue_position', v_position
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Process waiting queue for one mentor (FIFO + compatibility)
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
begin
  if not exists (
    select 1 from public.mentor_profiles mp
    where mp.user_id = p_mentor_id
      and mp.status = 'approved'
      and mp.is_accepting_students
  ) then
    return 0;
  end if;

  for v_entry in
    select wl.id as wait_id, wl.request_id, wl.student_id, mr.requested_mentor_id
    from public.mentorship_waiting_list wl
    join public.mentorship_requests mr on mr.id = wl.request_id
    where mr.status = 'waiting_list'
    order by wl.priority desc, wl.entered_at asc
  loop
    exit when not public.mentor_has_capacity(p_mentor_id);

    -- Direct-request students only match their chosen mentor
    if v_entry.requested_mentor_id is not null
      and v_entry.requested_mentor_id <> p_mentor_id
    then
      continue;
    end if;

    if exists (
      select 1 from public.mentorships m
      where m.student_id = v_entry.student_id and m.status = 'active'
    ) then
      update public.mentorship_requests
      set status = 'cancelled', cancelled_at = now(), cancel_reason = 'Student already has active mentorship', updated_at = now()
      where id = v_entry.request_id;
      delete from public.mentorship_waiting_list where id = v_entry.wait_id;
      continue;
    end if;

    v_score := public.mentorship_match_score(v_entry.student_id, p_mentor_id);

    if v_score < 1 then
      continue;
    end if;

    v_result := public.fulfill_mentorship_request(
      v_entry.request_id,
      v_entry.student_id,
      p_mentor_id,
      v_score
    );

    if v_result is not null then
      v_assigned := v_assigned + 1;
    end if;
  end loop;

  return v_assigned;
end;
$$;

-- ---------------------------------------------------------------------------
-- Student: Request a Coach
-- ---------------------------------------------------------------------------
create or replace function public.request_mentorship_coach(
  p_requested_mentor_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_request_id uuid;
  v_mentor_id uuid;
  v_score numeric;
  v_best_score numeric := -1;
  r record;
begin
  if v_student_id is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select * into v_profile from public.profiles where id = v_student_id;

  if v_profile.id is null then
    raise exception 'profile not found' using errcode = 'P0009';
  end if;

  if not v_profile.onboarding_complete then
    raise exception 'complete onboarding before requesting a coach' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.mentorships m
    where m.student_id = v_student_id and m.status = 'active'
  ) then
    raise exception 'you already have an active mentorship' using errcode = 'P0002';
  end if;

  if exists (
    select 1 from public.mentorship_requests mr
    where mr.student_id = v_student_id
      and mr.status in ('pending', 'waiting_list')
  ) then
    raise exception 'you already have a pending mentorship request' using errcode = 'P0003';
  end if;

  if p_requested_mentor_id is not null then
    if not exists (
      select 1 from public.mentor_profiles mp
      where mp.user_id = p_requested_mentor_id
        and mp.status = 'approved'
    ) then
      raise exception 'requested mentor is not available' using errcode = 'P0010';
    end if;
  end if;

  insert into public.mentorship_requests (
    student_id,
    status,
    requested_mentor_id,
    match_snapshot
  )
  values (
    v_student_id,
    'pending',
    p_requested_mentor_id,
    jsonb_build_object(
      'course_major', v_profile.course_major,
      'degree_level', v_profile.degree_level,
      'interests', to_jsonb(v_profile.interests),
      'career_interests', to_jsonb(v_profile.career_interests),
      'university', v_profile.university
    )
  )
  returning id into v_request_id;

  -- Specific mentor requested
  if p_requested_mentor_id is not null then
    v_score := public.mentorship_match_score(v_student_id, p_requested_mentor_id);

    if v_score >= 1 and public.mentor_has_capacity(p_requested_mentor_id) then
      return public.fulfill_mentorship_request(
        v_request_id,
        v_student_id,
        p_requested_mentor_id,
        v_score
      );
    end if;

    return public.enqueue_mentorship_request(v_request_id, v_student_id);
  end if;

  -- Best compatible mentor with capacity
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

  if v_mentor_id is not null then
    return public.fulfill_mentorship_request(
      v_request_id,
      v_student_id,
      v_mentor_id,
      v_best_score
    );
  end if;

  return public.enqueue_mentorship_request(v_request_id, v_student_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- Cancel open request (student)
-- ---------------------------------------------------------------------------
create or replace function public.cancel_mentorship_request(
  p_request_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid := auth.uid();
  v_request public.mentorship_requests%rowtype;
begin
  if v_student_id is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if p_request_id is not null then
    select * into v_request
    from public.mentorship_requests mr
    where mr.id = p_request_id and mr.student_id = v_student_id;
  else
    select * into v_request
    from public.mentorship_requests mr
    where mr.student_id = v_student_id
      and mr.status in ('pending', 'waiting_list')
    order by mr.created_at desc
    limit 1;
  end if;

  if v_request.id is null then
    raise exception 'no open mentorship request found' using errcode = 'P0011';
  end if;

  if v_request.status not in ('pending', 'waiting_list') then
    raise exception 'request cannot be cancelled' using errcode = 'P0012';
  end if;

  update public.mentorship_requests
  set
    status = 'cancelled',
    cancelled_at = now(),
    updated_at = now()
  where id = v_request.id;

  delete from public.mentorship_waiting_list where request_id = v_request.id;

  return jsonb_build_object('outcome', 'cancelled', 'request_id', v_request.id);
end;
$$;

-- ---------------------------------------------------------------------------
-- End active mentorship (student leave / coach remove)
-- ---------------------------------------------------------------------------
create or replace function public.end_mentorship(
  p_mentorship_id uuid,
  p_status text,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_mentorship public.mentorships%rowtype;
  v_assigned int;
begin
  if v_user_id is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if p_status not in ('left_by_student', 'removed_by_mentor', 'ended') then
    raise exception 'invalid end status' using errcode = 'P0013';
  end if;

  select * into v_mentorship
  from public.mentorships m
  where m.id = p_mentorship_id;

  if v_mentorship.id is null then
    raise exception 'mentorship not found' using errcode = 'P0004';
  end if;

  if v_mentorship.status <> 'active' then
    raise exception 'mentorship is not active' using errcode = 'P0006';
  end if;

  if p_status = 'left_by_student' and v_user_id <> v_mentorship.student_id then
    raise exception 'only the student can leave this mentorship' using errcode = 'P0005';
  end if;

  if p_status = 'removed_by_mentor' and v_user_id <> v_mentorship.mentor_id then
    raise exception 'only the mentor can remove this student' using errcode = 'P0005';
  end if;

  if p_status = 'ended'
    and v_user_id not in (v_mentorship.student_id, v_mentorship.mentor_id)
    and not public.current_user_is_admin()
  then
    raise exception 'not authorized' using errcode = 'P0005';
  end if;

  update public.mentorships
  set
    status = p_status,
    ended_at = now(),
    end_reason = coalesce(nullif(trim(p_reason), ''), end_reason),
    updated_at = now()
  where id = p_mentorship_id;

  v_assigned := public.process_mentor_waiting_queue(v_mentorship.mentor_id);

  return jsonb_build_object(
    'outcome', 'ended',
    'mentorship_id', p_mentorship_id,
    'status', p_status,
    'queue_assigned', v_assigned
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Maintenance: expire due mentorships + fill freed slots
-- ---------------------------------------------------------------------------
create or replace function public.run_mentorship_maintenance()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mentor_ids uuid[];
  v_expired int := 0;
  v_total_assigned int := 0;
  v_assigned int;
  v_mentor_id uuid;
begin
  select array_agg(distinct m.mentor_id)
  into v_mentor_ids
  from public.mentorships m
  where m.status = 'active'
    and m.ends_at <= now();

  v_expired := public.expire_due_mentorships();

  if v_mentor_ids is not null then
    foreach v_mentor_id in array v_mentor_ids loop
      v_assigned := public.process_mentor_waiting_queue(v_mentor_id);
      v_total_assigned := v_total_assigned + v_assigned;
    end loop;
  end if;

  -- Also process mentors with spare capacity (catch-up)
  for v_mentor_id in
    select mp.user_id
    from public.mentor_profiles mp
    where mp.status = 'approved'
      and mp.is_accepting_students
      and public.mentor_has_capacity(mp.user_id)
  loop
    v_assigned := public.process_mentor_waiting_queue(v_mentor_id);
    v_total_assigned := v_total_assigned + v_assigned;
  end loop;

  return jsonb_build_object(
    'expired', v_expired,
    'assigned', v_total_assigned
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
revoke all on function public.mentor_has_capacity(uuid) from public;
grant execute on function public.mentor_has_capacity(uuid) to authenticated;

revoke all on function public.is_mentor_compatible(uuid, uuid, numeric) from public;
grant execute on function public.is_mentor_compatible(uuid, uuid, numeric) to authenticated;

revoke all on function public.request_mentorship_coach(uuid) from public;
grant execute on function public.request_mentorship_coach(uuid) to authenticated;

revoke all on function public.cancel_mentorship_request(uuid) from public;
grant execute on function public.cancel_mentorship_request(uuid) to authenticated;

revoke all on function public.end_mentorship(uuid, text, text) from public;
grant execute on function public.end_mentorship(uuid, text, text) to authenticated;

revoke all on function public.process_mentor_waiting_queue(uuid) from public;
grant execute on function public.process_mentor_waiting_queue(uuid) to service_role;

revoke all on function public.run_mentorship_maintenance() from public;
grant execute on function public.run_mentorship_maintenance() to service_role;

-- Internal helpers: service_role only
revoke all on function public.fulfill_mentorship_request(uuid, uuid, uuid, numeric) from public;
grant execute on function public.fulfill_mentorship_request(uuid, uuid, uuid, numeric) to service_role;

revoke all on function public.enqueue_mentorship_request(uuid, uuid) from public;
grant execute on function public.enqueue_mentorship_request(uuid, uuid) to service_role;
