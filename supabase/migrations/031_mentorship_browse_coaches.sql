-- Ensure students can load coach browse data (profiles RLS + resilient list RPC).

drop policy if exists "Students browse approved coach profiles" on public.profiles;
create policy "Students browse approved coach profiles"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1
      from public.mentor_profiles mp
      where mp.user_id = profiles.id
        and mp.status = 'approved'
    )
  );

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
        'id', coalesce(p.id, mp.user_id),
        'full_name', p.full_name,
        'email', p.email,
        'avatar_url', p.avatar_url,
        'country', p.country,
        'university', p.university,
        'course_major', p.course_major,
        'degree_level', p.degree_level,
        'interests', to_jsonb(coalesce(p.interests, '{}'::text[])),
        'career_interests', to_jsonb(coalesce(p.career_interests, '{}'::text[]))
      ),
      'mentor_profile', jsonb_build_object(
        'user_id', mp.user_id,
        'status', mp.status,
        'bio', mp.bio,
        'mentoring_majors', to_jsonb(coalesce(mp.mentoring_majors, '{}'::text[])),
        'mentoring_interests', to_jsonb(coalesce(mp.mentoring_interests, '{}'::text[])),
        'mentoring_career_areas', to_jsonb(coalesce(mp.mentoring_career_areas, '{}'::text[])),
        'mentoring_degree_levels', to_jsonb(coalesce(mp.mentoring_degree_levels, '{}'::text[])),
        'max_students', mp.max_students,
        'is_accepting_students', mp.is_accepting_students
      )
    ) as row_data
    from public.mentor_profiles mp
    left join public.profiles p on p.id = mp.user_id
    where mp.status = 'approved'
  ) sub;

  return v_result;
end;
$$;

revoke all on function public.list_available_mentors() from public;
grant execute on function public.list_available_mentors() to authenticated;
