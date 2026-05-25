-- Notification system completion: email RPCs, CV reminders, preference fix, email tracking.

-- ---------------------------------------------------------------------------
-- CV abandonment reminder tracking
-- ---------------------------------------------------------------------------
alter table public.cvs
  add column if not exists reminder_count int not null default 0,
  add column if not exists last_reminder_sent_at timestamptz;

-- ---------------------------------------------------------------------------
-- Welcome email dedupe on profiles
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists welcome_email_sent_at timestamptz;

-- ---------------------------------------------------------------------------
-- Email delivery tracking on notifications (mentor match emails)
-- ---------------------------------------------------------------------------
alter table public.notifications
  add column if not exists email_sent_at timestamptz;

-- ---------------------------------------------------------------------------
-- Users can delete own notifications (swipe-to-delete)
-- ---------------------------------------------------------------------------
drop policy if exists "Users delete own notifications" on public.notifications;
create policy "Users delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- In-app notifications respect type prefs only (not push_enabled)
-- ---------------------------------------------------------------------------
create or replace function public.should_send_notification(
  p_user_id uuid,
  p_type text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select case
        when p_type = 'new_match' then np.new_matches
        when p_type = 'deadline_reminder' then np.deadline_reminders
        when p_type = 'saved_reminder' then np.saved_reminders
        when p_type in ('mentor_assigned', 'mentee_assigned') then np.mentorship_assignments
        when p_type = 'waiting_list_update' then np.waiting_list_updates
        when p_type in ('session_reminder', 'session_booked') then np.session_reminders
        when p_type = 'mentorship_message' then np.mentorship_messages
        when p_type = 'mentor_broadcast' then true
        else true
      end
      from public.notification_preferences np
      where np.user_id = p_user_id
    ),
    true
  );
$$;

-- ---------------------------------------------------------------------------
-- Deadline reminder email candidates (saved opportunities, 3 days out)
-- ---------------------------------------------------------------------------
-- Remote may have an older signature from manual SQL; must drop before replace.
drop function if exists public.get_deadline_reminders();

create function public.get_deadline_reminders()
returns table (
  user_id uuid,
  email text,
  full_name text,
  opportunity_id uuid,
  title text,
  organization text,
  deadline timestamptz,
  apply_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.email,
    p.full_name,
    o.id as opportunity_id,
    o.title,
    o.organization,
    o.deadline,
    o.apply_url
  from public.saved_opportunities s
  join public.opportunities o on o.id = s.opportunity_id
  join public.profiles p on p.id = s.user_id
  join public.notification_preferences np on np.user_id = s.user_id
  where p.email is not null
    and np.deadline_reminders = true
    and o.deadline > now()
    and (o.deadline::date - current_date) = 3;
$$;

revoke all on function public.get_deadline_reminders() from public;
grant execute on function public.get_deadline_reminders() to service_role;

-- ---------------------------------------------------------------------------
-- Incomplete CV detection (content progress < 100%, no successful payment)
-- ---------------------------------------------------------------------------
create or replace function public.cv_content_is_incomplete(p_content jsonb)
returns boolean
language plpgsql
immutable
as $$
declare
  v_content jsonb := coalesce(p_content, '{}'::jsonb);
  v_personal jsonb := coalesce(v_content->'personalInfo', '{}'::jsonb);
  v_name text := trim(coalesce(v_personal->>'fullName', ''));
  v_email text := trim(coalesce(v_personal->>'email', ''));
  v_summary text := trim(coalesce(v_content->>'summary', ''));
  v_exp jsonb := coalesce(v_content->'experience', '[]'::jsonb);
  v_edu jsonb := coalesce(v_content->'education', '[]'::jsonb);
  v_skills jsonb := coalesce(v_content->'skills', '[]'::jsonb);
  v_has_exp boolean := false;
  v_has_edu boolean := false;
  v_skill_count int := 0;
  elem jsonb;
begin
  if v_name = '' or v_email = '' then
    return true;
  end if;
  if char_length(v_summary) < 40 then
    return true;
  end if;

  for elem in select * from jsonb_array_elements(v_exp)
  loop
    if trim(coalesce(elem->>'company', '')) <> ''
      and trim(coalesce(elem->>'role', '')) <> ''
      and trim(coalesce(elem->>'startDate', '')) <> '' then
      v_has_exp := true;
      exit;
    end if;
  end loop;
  if not v_has_exp then
    return true;
  end if;

  for elem in select * from jsonb_array_elements(v_edu)
  loop
    if trim(coalesce(elem->>'school', '')) <> ''
      and trim(coalesce(elem->>'degree', '')) <> ''
      and trim(coalesce(elem->>'endDate', '')) <> '' then
      v_has_edu := true;
      exit;
    end if;
  end loop;
  if not v_has_edu then
    return true;
  end if;

  v_skill_count := jsonb_array_length(v_skills);
  if v_skill_count < 2 then
    return true;
  end if;

  return false;
end;
$$;

revoke all on function public.cv_content_is_incomplete(jsonb) from public;
grant execute on function public.cv_content_is_incomplete(jsonb) to service_role;

-- Ensure session_booked is in type constraint (idempotent with 018)
alter table public.notifications drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check check (type in (
    'new_match',
    'deadline_reminder',
    'saved_reminder',
    'mentor_assigned',
    'mentee_assigned',
    'waiting_list_update',
    'session_reminder',
    'mentorship_message',
    'mentor_broadcast',
    'session_booked'
  ));
