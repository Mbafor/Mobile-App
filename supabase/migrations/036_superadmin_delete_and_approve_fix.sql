-- 036_superadmin_delete_and_approve_fix.sql
--
-- Fixes two gaps in super-admin mentor management:
--
-- 1. super_admin_approve_mentor: previously did a silent UPDATE with no
--    existence check, so an invalid user_id returned { ok: true }. Now
--    validates the mentor profile exists first.
--
-- 2. super_admin_delete_mentor: previously only ended *active* mentorships
--    and cancelled upcoming sessions, but left open mentorship_requests
--    (pending / waiting_list) that specifically targeted the deleted mentor.
--    Those students were stuck in limbo. Now:
--      - Removes waiting-list entries for students who specifically queued
--        for this mentor (general-queue students stay in queue for others).
--      - Cancels those open requests with a clear reason.
--      - Adds cancel_reason to session cancellations.
--      - Deletes availability_slots in addition to availability_rules.

-- ---------------------------------------------------------------------------
-- 1. Fix: super_admin_approve_mentor
-- ---------------------------------------------------------------------------
create or replace function public.super_admin_approve_mentor(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows int;
begin
  if not public.current_user_is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.mentor_profiles where user_id = p_user_id
  ) then
    raise exception 'mentor profile not found' using errcode = 'P0002';
  end if;

  perform set_config('row_security', 'off', true);

  update public.mentor_profiles
  set
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    rejection_reason = null,
    updated_at = now()
  where user_id = p_user_id;

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    raise exception 'failed to approve mentor' using errcode = 'P0017';
  end if;

  perform public.log_admin_action(
    'mentor.approve', 'mentor_profile', p_user_id, '{}'::jsonb
  );

  return jsonb_build_object('ok', true, 'user_id', p_user_id);
end;
$$;

grant execute on function public.super_admin_approve_mentor(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Fix: super_admin_delete_mentor — complete student-state cleanup
-- ---------------------------------------------------------------------------
create or replace function public.super_admin_delete_mentor(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows              int;
  v_ended_mentorships int;
  v_cancelled_sessions int;
  v_cancelled_requests int;
begin
  if not public.current_user_is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.mentor_profiles where user_id = p_user_id
  ) then
    raise exception 'mentor not found' using errcode = 'P0002';
  end if;

  perform set_config('row_security', 'off', true);

  -- Step 1: Cancel all upcoming sessions for this coach.
  --   cancel_reason set here so students see a meaningful message.
  update public.mentorship_sessions
  set
    status       = 'cancelled',
    cancelled_at = coalesce(cancelled_at, now()),
    cancel_reason = 'Coach profile removed by platform',
    updated_at   = now()
  where coach_id = p_user_id
    and status in ('pending', 'proposed', 'confirmed');

  get diagnostics v_cancelled_sessions = row_count;

  -- Step 2: End all active mentorships for this coach.
  --   The mentorship_status_cascade trigger (028) fires on this update
  --   and will cancel any sessions not caught above.
  update public.mentorships
  set
    status     = 'ended',
    ended_at   = coalesce(ended_at, now()),
    end_reason = 'Coach profile removed by platform',
    updated_at = now()
  where mentor_id = p_user_id
    and status = 'active';

  get diagnostics v_ended_mentorships = row_count;

  -- Step 3: Remove waiting-list entries for students who were specifically
  --   queuing for THIS mentor. Students in the general queue (no specific
  --   mentor requested) are left in the queue to be matched with others.
  delete from public.mentorship_waiting_list wl
  using public.mentorship_requests mr
  where wl.request_id        = mr.id
    and mr.requested_mentor_id = p_user_id
    and mr.status            = 'waiting_list';

  -- Step 4: Cancel all open requests that specifically targeted this mentor.
  update public.mentorship_requests
  set
    status        = 'cancelled',
    cancelled_at  = now(),
    cancel_reason = 'Requested mentor is no longer available on the platform',
    updated_at    = now()
  where requested_mentor_id = p_user_id
    and status in ('pending', 'waiting_list');

  get diagnostics v_cancelled_requests = row_count;

  -- Step 5: Remove coach availability configuration.
  delete from public.mentor_availability_rules where mentor_id = p_user_id;
  delete from public.availability_slots        where coach_id  = p_user_id;

  -- Step 6: Delete the mentor profile.
  --   The mentor_profiles_status_cascade trigger (027) fires here but
  --   all related rows are already cleaned up above.
  delete from public.mentor_profiles where user_id = p_user_id;

  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'failed to remove mentor profile' using errcode = 'P0017';
  end if;

  perform public.log_admin_action(
    'mentor.delete',
    'mentor_profile',
    p_user_id,
    jsonb_build_object(
      'ended_active_mentorships', v_ended_mentorships,
      'cancelled_sessions',       v_cancelled_sessions,
      'cancelled_requests',       v_cancelled_requests
    )
  );

  return jsonb_build_object(
    'ok',                        true,
    'ended_active_mentorships',  v_ended_mentorships,
    'cancelled_sessions',        v_cancelled_sessions,
    'cancelled_requests',        v_cancelled_requests
  );
end;
$$;

grant execute on function public.super_admin_delete_mentor(uuid) to authenticated;
