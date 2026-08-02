-- Revise mentorship_match_score() (013_mentorship.sql) from a flat weighted
-- sum to a strict priority order: Major, then interest (general + career),
-- then everything else (degree level). The old weights (major 25, degree 15,
-- interests 30, career 30) let a mentor with no major match but both interest
-- overlaps (60) outrank a major-only match (25) -- exactly the wrong order
-- for "recommend by major first". Tiers are spaced so a higher tier always
-- dominates the full range of everything below it:
--   major (100)  >  interests+career (max 10)  >  degree level (1)
-- 100 > 10 + 1, and each nonzero interest contribution (5) > degree level's
-- max (1), so sorting by this score descending is equivalent to sorting by
-- (major_match, interest_match_count, degree_level_match) lexicographically.
-- Same field names, same null/approved guards, same mentor_profiles.mentoring_*
-- OR mentor's-own-profile fallback logic as before -- only the point values
-- (and the removal of the score cap, which would have flattened the tiers
-- back together) change.
create or replace function public.mentorship_match_score(
  p_student_id uuid,
  p_mentor_id uuid
)
returns numeric
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_student public.profiles%rowtype;
  v_mentor_profile public.mentor_profiles%rowtype;
  v_mentor_user public.profiles%rowtype;
  v_score numeric := 0;
begin
  select * into v_student from public.profiles where id = p_student_id;
  select * into v_mentor_profile from public.mentor_profiles where user_id = p_mentor_id;
  select * into v_mentor_user from public.profiles where id = p_mentor_id;

  if v_student.id is null or v_mentor_profile.user_id is null or v_mentor_user.id is null then
    return 0;
  end if;

  if v_mentor_profile.status <> 'approved' then
    return 0;
  end if;

  -- Tier 1: Major (100) -- dominates every lower tier combined.
  if v_student.course_major is not null
    and (
      v_student.course_major = any (v_mentor_profile.mentoring_majors)
      or v_student.course_major = v_mentor_user.course_major
    )
  then
    v_score := v_score + 100;
  end if;

  -- Tier 2: Interest (general + career, 5 each, max 10) -- dominates tier 3.
  if cardinality(v_student.interests) > 0
    and (
      v_student.interests && v_mentor_profile.mentoring_interests
      or v_student.interests && v_mentor_user.interests
    )
  then
    v_score := v_score + 5;
  end if;

  if cardinality(v_student.career_interests) > 0
    and (
      v_student.career_interests && v_mentor_profile.mentoring_career_areas
      or v_student.career_interests && v_mentor_user.career_interests
    )
  then
    v_score := v_score + 5;
  end if;

  -- Tier 3: other things -- degree level (1), the final tiebreaker.
  if v_student.degree_level is not null
    and (
      v_student.degree_level = any (v_mentor_profile.mentoring_degree_levels)
      or v_student.degree_level = v_mentor_user.degree_level
    )
  then
    v_score := v_score + 1;
  end if;

  return v_score;
end;
$$;
