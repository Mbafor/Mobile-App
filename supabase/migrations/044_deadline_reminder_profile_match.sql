-- Expand get_deadline_reminders() to also cover profile-matched users
-- (not just those who saved the opportunity).
-- Matching logic mirrors get_opportunity_matched_users (043), but checks
-- deadline_reminders preference instead of new_matches.

drop function if exists public.get_deadline_reminders();

create function public.get_deadline_reminders()
returns table (
  user_id        uuid,
  email          text,
  full_name      text,
  opportunity_id uuid,
  title          text,
  organization   text,
  deadline       timestamptz,
  apply_url      text
)
language sql
stable
security definer
set search_path = public
as $$

  -- ── Part 1: users who saved the opportunity (original behaviour) ──────────
  select
    p.id          as user_id,
    p.email,
    p.full_name,
    o.id          as opportunity_id,
    o.title,
    o.organization,
    o.deadline,
    o.apply_url
  from public.saved_opportunities     s
  join public.opportunities           o  on o.id       = s.opportunity_id
  join public.profiles                p  on p.id       = s.user_id
  join public.notification_preferences np on np.user_id = s.user_id
  where p.email              is not null
    and np.deadline_reminders = true
    and o.deadline            is not null
    and o.deadline            > now()
    and (o.deadline::date - current_date) = 3

  union

  -- ── Part 2: profile-matched users who have NOT saved the opportunity ──────
  -- Uses the same tag / degree / country criteria as get_opportunity_matched_users
  -- but respects deadline_reminders preference, not new_matches.
  select distinct
    p.id          as user_id,
    p.email,
    p.full_name,
    o.id          as opportunity_id,
    o.title,
    o.organization,
    o.deadline,
    o.apply_url
  from public.opportunities           o
  join public.profiles                p  on p.email is not null
                                        and p.onboarding_complete = true
  left join public.user_preferences  up  on up.user_id = p.id
  join public.notification_preferences np on np.user_id = p.id
  where np.deadline_reminders = true
    and o.status    = 'approved'
    and o.is_active = true
    and o.deadline  is not null
    and o.deadline  > now()
    and (o.deadline::date - current_date) = 3
    -- Profile match (tag OR degree OR country — same logic as migration 043)
    and (
      -- Tag match
      (
        array_length(o.tags, 1) > 0
        and exists (
          select 1
          from   unnest(o.tags) as opp_tag
          cross join unnest(
            coalesce(p.interests,        '{}')
            || coalesce(p.career_interests, '{}')
            || coalesce(up.opportunity_types, '{}')
          ) as user_kw
          where  length(trim(user_kw)) > 0
            and (
              lower(opp_tag)    ilike '%' || lower(trim(user_kw)) || '%'
              or lower(trim(user_kw)) ilike '%' || lower(opp_tag)    || '%'
            )
        )
      )
      -- Degree match
      or (
        array_length(o.degree_levels, 1) > 0
        and p.degree_level is not null
        and p.degree_level = any(o.degree_levels)
      )
      -- Country match (profile country or preferred countries)
      or (
        o.country is not null
        and (
          lower(coalesce(p.country, '')) = lower(o.country)
          or (
            array_length(coalesce(up.preferred_countries, '{}'), 1) > 0
            and lower(o.country) = any(
              select lower(c) from unnest(up.preferred_countries) c
            )
          )
        )
      )
    )
    -- Exclude users who already saved it — they appear in Part 1
    and not exists (
      select 1
      from   public.saved_opportunities s
      where  s.user_id        = p.id
        and  s.opportunity_id = o.id
    );

$$;

revoke all on function public.get_deadline_reminders() from public;
grant execute on function public.get_deadline_reminders() to service_role;
