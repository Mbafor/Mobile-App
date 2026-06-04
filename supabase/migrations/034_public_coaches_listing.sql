-- Public coaches listing function
-- Returns only approved, active coaches — safe for unauthenticated (anon) callers.
-- Uses SECURITY DEFINER to bypass RLS on the underlying tables.
-- Data is automatically live: new approved coaches appear instantly,
-- deactivated / rejected coaches are excluded.

CREATE OR REPLACE FUNCTION public_list_coaches()
RETURNS TABLE (
  user_id           uuid,
  full_name         text,
  avatar_url        text,
  country           text,
  university        text,
  degree_level      text,
  course_major      text,
  bio               text,
  mentoring_majors  text[],
  mentoring_interests text[],
  mentoring_career_areas text[],
  is_accepting_students boolean
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    mp.user_id,
    p.full_name,
    p.avatar_url,
    p.country,
    p.university,
    p.degree_level,
    p.course_major,
    mp.bio,
    mp.mentoring_majors,
    mp.mentoring_interests,
    mp.mentoring_career_areas,
    mp.is_accepting_students
  FROM mentor_profiles mp
  JOIN profiles p ON p.id = mp.user_id
  WHERE mp.status = 'approved'
  ORDER BY p.full_name NULLS LAST;
$$;

-- Allow the anon (unauthenticated) role to call this function.
GRANT EXECUTE ON FUNCTION public_list_coaches() TO anon;
GRANT EXECUTE ON FUNCTION public_list_coaches() TO authenticated;
