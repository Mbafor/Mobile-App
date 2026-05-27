-- Super Admin management: reliable revoke admin + remove mentor with data integrity.

-- Audit log inserts from super-admin RPCs (security definer may still hit RLS in some setups)
drop policy if exists "Super admins insert audit log" on public.admin_audit_log;
create policy "Super admins insert audit log"
  on public.admin_audit_log for insert
  to authenticated
  with check (public.current_user_is_super_admin());

drop policy if exists "Super admins delete mentor profiles" on public.mentor_profiles;
create policy "Super admins delete mentor profiles"
  on public.mentor_profiles for delete
  to authenticated
  using (public.current_user_is_super_admin());

create or replace function public.log_admin_action(
  p_action text,
  p_entity_type text,
  p_entity_id uuid default null,
  p_metadata jsonb default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('row_security', 'off', true);
  insert into public.admin_audit_log (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'));
end;
$$;

create or replace function public.super_admin_set_admin(
  p_user_id uuid,
  p_is_admin boolean
)
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

  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'profile not found' using errcode = 'P0015';
  end if;

  if exists (select 1 from public.profiles where id = p_user_id and is_super_admin) then
    raise exception 'cannot change admin flag on super admin account' using errcode = 'P0014';
  end if;

  update public.profiles
  set is_admin = p_is_admin, updated_at = now()
  where id = p_user_id;

  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'failed to update admin access' using errcode = 'P0017';
  end if;

  perform public.log_admin_action(
    'admin.set_flag', 'profile', p_user_id,
    jsonb_build_object('is_admin', p_is_admin)
  );

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.super_admin_delete_mentor(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows int;
  v_ended int;
begin
  if not public.current_user_is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if not exists (select 1 from public.mentor_profiles where user_id = p_user_id) then
    raise exception 'mentor not found' using errcode = 'P0002';
  end if;

  perform set_config('row_security', 'off', true);

  -- Cancel upcoming sessions for this coach
  update public.mentorship_sessions
  set
    status = 'cancelled',
    cancelled_at = coalesce(cancelled_at, now()),
    ended_at = coalesce(ended_at, now()),
    updated_at = now()
  where coach_id = p_user_id
    and status in ('pending', 'proposed', 'confirmed');

  -- End active mentorships so mentees are not orphaned on an inactive coach
  update public.mentorships
  set
    status = 'ended',
    ended_at = now(),
    end_reason = coalesce(
      nullif(trim(end_reason), ''),
      'Coach profile removed by platform'
    ),
    updated_at = now()
  where mentor_id = p_user_id
    and status = 'active';

  get diagnostics v_ended = row_count;

  delete from public.mentor_availability_rules
  where mentor_id = p_user_id;

  delete from public.mentor_profiles
  where user_id = p_user_id;

  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'failed to remove mentor profile' using errcode = 'P0017';
  end if;

  perform public.log_admin_action(
    'mentor.delete',
    'mentor_profile',
    p_user_id,
    jsonb_build_object('ended_active_mentorships', v_ended)
  );

  return jsonb_build_object('ok', true, 'ended_active_mentorships', v_ended);
end;
$$;

grant execute on function public.super_admin_set_admin(uuid, boolean) to authenticated;
grant execute on function public.super_admin_delete_mentor(uuid) to authenticated;
