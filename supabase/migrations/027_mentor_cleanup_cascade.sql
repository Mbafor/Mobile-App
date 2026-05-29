-- Mentor cleanup cascade: Ensure data integrity when a mentor profile is deleted or suspended.
-- If a mentor is removed via raw SQL or an admin action, we must clean up their mentorships
-- and pending sessions to avoid orphaned states on the student side.

create or replace function public.mentor_profile_status_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- If deleted, or if status changed from approved to anything else
  if tg_op = 'DELETE' or (tg_op = 'UPDATE' and old.status = 'approved' and new.status <> 'approved') then
    
    -- 1. Cancel upcoming sessions
    update public.mentorship_sessions
    set
      status = 'cancelled',
      cancelled_at = coalesce(cancelled_at, now()),
      cancel_reason = 'Coach is no longer available on the platform',
      updated_at = now()
    where coach_id = old.user_id
      and status in ('pending', 'proposed', 'confirmed');

    -- 2. End active mentorships
    update public.mentorships
    set
      status = 'ended',
      ended_at = now(),
      end_reason = 'Coach is no longer available on the platform',
      updated_at = now()
    where mentor_id = old.user_id
      and status = 'active';
      
    -- 3. Remove availability slots (these are weekly recurring rules and specific generated slots)
    delete from public.mentor_availability_rules
    where mentor_id = old.user_id;
    
    delete from public.availability_slots
    where coach_id = old.user_id;
    
  end if;
  
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists mentor_profiles_status_cascade on public.mentor_profiles;
create trigger mentor_profiles_status_cascade
  after update or delete on public.mentor_profiles
  for each row execute function public.mentor_profile_status_trigger();

-- ---------------------------------------------------------------------------
-- Immediate Cleanup of existing orphaned state
-- ---------------------------------------------------------------------------

-- End mentorships for coaches that no longer exist or aren't approved
update public.mentorships m
set
  status = 'ended',
  ended_at = now(),
  end_reason = 'Coach is no longer available on the platform',
  updated_at = now()
where status = 'active'
  and not exists (
    select 1 from public.mentor_profiles mp
    where mp.user_id = m.mentor_id
      and mp.status = 'approved'
  );

-- Cancel sessions for coaches that no longer exist or aren't approved
update public.mentorship_sessions s
set
  status = 'cancelled',
  cancelled_at = coalesce(cancelled_at, now()),
  cancel_reason = 'Coach is no longer available on the platform',
  updated_at = now()
where status in ('pending', 'proposed', 'confirmed')
  and not exists (
    select 1 from public.mentor_profiles mp
    where mp.user_id = s.coach_id
      and mp.status = 'approved'
  );
