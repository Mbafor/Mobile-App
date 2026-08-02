-- Super-admin visibility into why mentorships end early (student leaves /
-- mentor removes), so the 60% "ended by student" rate flagged in
-- docs/user-analytics-2026-08-02.md can actually be investigated instead of
-- only counted. Reads mentorships.end_reason, which already existed
-- (013_mentorship.sql) but had no UI ever writing to it and no admin surface
-- reading it.
create or replace function public.get_super_admin_mentorship_exits(
  p_search text default null,
  p_limit int default 20,
  p_offset int default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_items jsonb;
  v_total int;
begin
  if not public.current_user_is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select count(*)::int into v_total
  from public.mentorships m
  join public.profiles sp on sp.id = m.student_id
  where m.status in ('left_by_student', 'removed_by_mentor')
    and (
      p_search is null
      or sp.full_name ilike '%' || p_search || '%'
      or sp.email ilike '%' || p_search || '%'
    );

  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v_items
  from (
    select
      m.id as mentorship_id,
      m.status,
      m.started_at,
      m.ended_at,
      m.end_reason,
      m.student_id,
      m.mentor_id,
      sp.full_name as student_name,
      sp.email as student_email,
      mp_prof.full_name as mentor_name
    from public.mentorships m
    join public.profiles sp on sp.id = m.student_id
    join public.profiles mp_prof on mp_prof.id = m.mentor_id
    where m.status in ('left_by_student', 'removed_by_mentor')
      and (
        p_search is null
        or sp.full_name ilike '%' || p_search || '%'
        or sp.email ilike '%' || p_search || '%'
      )
    order by m.ended_at desc nulls last
    limit greatest(p_limit, 1)
    offset greatest(p_offset, 0)
  ) t;

  return jsonb_build_object('items', v_items, 'total', v_total);
end;
$$;

grant execute on function public.get_super_admin_mentorship_exits(text, int, int) to authenticated;
