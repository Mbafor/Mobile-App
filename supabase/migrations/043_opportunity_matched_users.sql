-- RPC used by the send-new-opportunity-emails edge function (service_role only).
-- Returns users whose profile matches the given approved+active opportunity via:
--   1. Tag match  — any profile interest / career_interest / preference type overlaps an opportunity tag
--   2. Degree match — profile degree_level is listed in opportunity degree_levels
--   3. Country match — profile country or preferred_countries matches opportunity country
-- Only includes users who have new_matches notifications enabled and have completed onboarding.

create or replace function public.get_opportunity_matched_users(
  p_opportunity_id uuid
)
returns table (
  user_id   uuid,
  email     text,
  full_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tags          text[];
  v_degree_levels text[];
  v_country       text;
begin
  select tags, degree_levels, country
  into   v_tags, v_degree_levels, v_country
  from   public.opportunities
  where  id        = p_opportunity_id
    and  status    = 'approved'
    and  is_active = true;

  if not found then
    return;
  end if;

  return query
  select distinct p.id, p.email, p.full_name
  from   public.profiles p
  join   public.notification_preferences np on np.user_id = p.id
  left join public.user_preferences up on up.user_id = p.id
  where  np.new_matches       = true
    and  p.onboarding_complete = true
    and  p.email is not null
    and  (
      -- 1. Tag match: any user keyword overlaps any opportunity tag (substring both ways)
      (
        array_length(v_tags, 1) > 0
        and exists (
          select 1
          from   unnest(v_tags) as opp_tag
          cross join unnest(
            coalesce(p.interests, '{}')
            || coalesce(p.career_interests, '{}')
            || coalesce(up.opportunity_types, '{}')
          ) as user_kw
          where  length(trim(user_kw)) > 0
            and  (
              lower(opp_tag) ilike '%' || lower(trim(user_kw)) || '%'
              or lower(trim(user_kw)) ilike '%' || lower(opp_tag) || '%'
            )
        )
      )
      -- 2. Degree match
      or (
        array_length(v_degree_levels, 1) > 0
        and p.degree_level is not null
        and p.degree_level = any(v_degree_levels)
      )
      -- 3. Country match (profile country or preferred countries)
      or (
        v_country is not null
        and (
          lower(coalesce(p.country, '')) = lower(v_country)
          or (
            array_length(coalesce(up.preferred_countries, '{}'), 1) > 0
            and lower(v_country) = any(
              select lower(c) from unnest(up.preferred_countries) c
            )
          )
        )
      )
    );
end;
$$;

grant execute on function public.get_opportunity_matched_users(uuid) to service_role;
