-- Student-driven coach selection: browse mentors, choose instantly, no auto-assign.
-- Keeps matching score for recommendations; waiting list only when no coaches available.

-- ---------------------------------------------------------------------------
-- Fulfill: allow student-chosen mentors without compatibility gate
-- ---------------------------------------------------------------------------
create or replace function public.fulfill_mentorship_request(
  p_request_id uuid,
  p_student_id uuid,
  p_mentor_id uuid,
  p_match_score numeric,
  p_skip_compatibility boolean default false
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

  if not p_skip_compatibility
    and not public.is_mentor_compatible(p_student_id, p_mentor_id, 1) then
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
-- List mentors for student browse (sorted by match score on client/RPC)
-- ---------------------------------------------------------------------------
create or replace function public.list_available_mentors()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_student_id uuid := auth.uid();
  v_result jsonb := '[]'::jsonb;
begin
  if v_student_id is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(row_data order by (row_data->>'match_score')::numeric desc), '[]'::jsonb)
  into v_result
  from (
    select jsonb_build_object(
      'mentor_user_id', mp.user_id,
      'match_score', public.mentorship_match_score(v_student_id, mp.user_id),
      'active_mentee_count', public.mentor_active_mentee_count(mp.user_id),
      'max_students', mp.max_students,
      'has_capacity', public.mentor_has_capacity(mp.user_id),
      'is_accepting_students', mp.is_accepting_students,
      'profile', jsonb_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'email', p.email,
        'avatar_url', p.avatar_url,
        'country', p.country,
        'university', p.university,
        'course_major', p.course_major,
        'degree_level', p.degree_level,
        'interests', to_jsonb(p.interests),
        'career_interests', to_jsonb(p.career_interests)
      ),
      'mentor_profile', jsonb_build_object(
        'user_id', mp.user_id,
        'status', mp.status,
        'bio', mp.bio,
        'mentoring_majors', to_jsonb(mp.mentoring_majors),
        'mentoring_interests', to_jsonb(mp.mentoring_interests),
        'mentoring_career_areas', to_jsonb(mp.mentoring_career_areas),
        'mentoring_degree_levels', to_jsonb(mp.mentoring_degree_levels),
        'max_students', mp.max_students,
        'is_accepting_students', mp.is_accepting_students
      )
    ) as row_data
    from public.mentor_profiles mp
    join public.profiles p on p.id = mp.user_id
    where mp.status = 'approved'
  ) sub;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Student chooses a coach (instant assignment, no queue for direct choice)
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
  v_score numeric;
  v_has_any_mentor boolean;
  v_has_capacity_mentor boolean;
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

  select exists (
    select 1 from public.mentor_profiles mp where mp.status = 'approved'
  ) into v_has_any_mentor;

  select exists (
    select 1
    from public.mentor_profiles mp
    where mp.status = 'approved'
      and mp.is_accepting_students
      and public.mentor_has_capacity(mp.user_id)
  ) into v_has_capacity_mentor;

  -- No mentor id: only enqueue when platform has no coaches or all are full
  if p_requested_mentor_id is null then
    if not v_has_any_mentor or not v_has_capacity_mentor then
      insert into public.mentorship_requests (
        student_id,
        status,
        match_snapshot
      )
      values (
        v_student_id,
        'pending',
        jsonb_build_object(
          'course_major', v_profile.course_major,
          'degree_level', v_profile.degree_level,
          'interests', to_jsonb(v_profile.interests),
          'career_interests', to_jsonb(v_profile.career_interests),
          'university', v_profile.university
        )
      )
      returning id into v_request_id;

      return public.enqueue_mentorship_request(v_request_id, v_student_id);
    end if;

    raise exception 'select a coach from the browse list' using errcode = 'P0014';
  end if;

  if not exists (
    select 1 from public.mentor_profiles mp
    where mp.user_id = p_requested_mentor_id
      and mp.status = 'approved'
      and mp.is_accepting_students
  ) then
    raise exception 'requested mentor is not available' using errcode = 'P0010';
  end if;

  if not public.mentor_has_capacity(p_requested_mentor_id) then
    raise exception 'mentor has no available slots' using errcode = 'P0007';
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

  v_score := public.mentorship_match_score(v_student_id, p_requested_mentor_id);

  return public.fulfill_mentorship_request(
    v_request_id,
    v_student_id,
    p_requested_mentor_id,
    v_score,
    true
  );
end;
$$;

-- Queue processor: use skip compatibility for fallback (score 0) assignments
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

    if exists (
      select 1 from public.mentorships m
      where m.student_id = v_entry.student_id and m.status = 'active'
    ) then
      update public.mentorship_requests
      set status = 'cancelled', cancelled_at = now(),
        cancel_reason = 'Student already has active mentorship', updated_at = now()
      where id = v_entry.request_id;
      delete from public.mentorship_waiting_list where id = v_entry.wait_id;
      continue;
    end if;

    v_score := public.mentorship_match_score(v_entry.student_id, p_mentor_id);

    if v_score >= 1 then
      v_result := public.fulfill_mentorship_request(
        v_entry.request_id, v_entry.student_id, p_mentor_id, v_score, false
      );
      if v_result is not null then
        v_assigned := v_assigned + 1;
      end if;
    elsif v_fallback_entry is null then
      v_fallback_entry := v_entry;
    end if;
  end loop;

  if public.mentor_has_capacity(p_mentor_id) and v_fallback_entry is not null then
    if exists (
      select 1 from public.mentorship_waiting_list where id = v_fallback_entry.wait_id
    ) then
      v_result := public.fulfill_mentorship_request(
        v_fallback_entry.request_id, v_fallback_entry.student_id, p_mentor_id, 0, true
      );
      if v_result is not null then
        v_assigned := v_assigned + 1;
      end if;
    end if;
  end if;

  return v_assigned;
end;
$$;

revoke all on function public.list_available_mentors() from public;
grant execute on function public.list_available_mentors() to authenticated;

revoke all on function public.request_mentorship_coach(uuid) from public;
grant execute on function public.request_mentorship_coach(uuid) to authenticated;
