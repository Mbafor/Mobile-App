-- Deadline reminders: restrict to users who explicitly saved the
-- opportunity. Removes the profile-matched branch added in
-- 044_deadline_reminder_profile_match.sql (tag/degree/country matching for
-- users who hadn't saved it) -- per product decision, a reminder should only
-- go to someone who actually bookmarked the opportunity, not anyone who
-- merely looks like a fit for it.

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
    and (o.deadline::date - current_date) = 3;
$$;

revoke all on function public.get_deadline_reminders() from public;
grant execute on function public.get_deadline_reminders() to service_role;
