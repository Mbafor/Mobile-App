-- Super Admin role, expanded notifications, audit log, mentor broadcasts, push pipeline.

-- ---------------------------------------------------------------------------
-- Super Admin flag (separate from opportunity is_admin)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_super_admin boolean not null default false;

create or replace function public.current_user_is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_super_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

revoke all on function public.current_user_is_super_admin() from public;
grant execute on function public.current_user_is_super_admin() to authenticated;

-- Prevent self-escalation of admin / super-admin flags
create or replace function public.profiles_guard_privileged_fields()
returns trigger
language plpgsql
as $$
begin
  if new.is_admin is distinct from old.is_admin
    or new.is_super_admin is distinct from old.is_super_admin
  then
    if not public.current_user_is_super_admin() then
      raise exception 'only super admins can change admin privileges'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_privileged_fields on public.profiles;
create trigger profiles_guard_privileged_fields
  before update on public.profiles
  for each row execute function public.profiles_guard_privileged_fields();

-- Mentor review: super admins only (replace admin policy from 013)
drop policy if exists "Admins review mentor applications" on public.mentor_profiles;

create policy "Super admins review mentor applications"
  on public.mentor_profiles for update
  to authenticated
  using (public.current_user_is_super_admin())
  with check (public.current_user_is_super_admin());

create policy "Super admins read all mentor profiles"
  on public.mentor_profiles for select
  to authenticated
  using (public.current_user_is_super_admin());

-- Super admins read platform mentorship data
create policy "Super admins read all mentorships"
  on public.mentorships for select
  to authenticated
  using (public.current_user_is_super_admin());

create policy "Super admins read all mentorship requests"
  on public.mentorship_requests for select
  to authenticated
  using (public.current_user_is_super_admin());

create policy "Super admins manage waiting list"
  on public.mentorship_waiting_list for all
  to authenticated
  using (public.current_user_is_super_admin())
  with check (public.current_user_is_super_admin());

create policy "Super admins read all profiles"
  on public.profiles for select
  to authenticated
  using (public.current_user_is_super_admin());

create policy "Super admins update profiles for admin management"
  on public.profiles for update
  to authenticated
  using (public.current_user_is_super_admin())
  with check (public.current_user_is_super_admin());

-- ---------------------------------------------------------------------------
-- Admin audit log
-- ---------------------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_idx
  on public.admin_audit_log (created_at desc);

create index if not exists admin_audit_log_actor_idx
  on public.admin_audit_log (actor_id, created_at desc);

alter table public.admin_audit_log enable row level security;

create policy "Super admins read audit log"
  on public.admin_audit_log for select
  to authenticated
  using (public.current_user_is_super_admin());

-- ---------------------------------------------------------------------------
-- Mentor broadcasts (audit + notification source)
-- ---------------------------------------------------------------------------
create table if not exists public.mentor_broadcasts (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users (id) on delete cascade,
  subject text not null,
  body text not null,
  target_type text not null check (target_type in ('all_mentors', 'single_mentor')),
  target_mentor_id uuid references auth.users (id) on delete set null,
  recipients_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.mentor_broadcasts enable row level security;

create policy "Super admins manage mentor broadcasts"
  on public.mentor_broadcasts for all
  to authenticated
  using (public.current_user_is_super_admin())
  with check (public.current_user_is_super_admin());

-- ---------------------------------------------------------------------------
-- Expand notifications
-- ---------------------------------------------------------------------------
alter table public.notifications
  add column if not exists metadata jsonb not null default '{}';

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
    'mentor_broadcast'
  ));

alter table public.notification_preferences
  add column if not exists mentorship_assignments boolean not null default true,
  add column if not exists waiting_list_updates boolean not null default true,
  add column if not exists session_reminders boolean not null default true,
  add column if not exists mentorship_messages boolean not null default true;

-- Service role can insert notifications for any user (push pipeline)
create policy "Service role inserts notifications"
  on public.notifications for insert
  to service_role
  with check (true);

-- ---------------------------------------------------------------------------
-- Audit helper
-- ---------------------------------------------------------------------------
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
  insert into public.admin_audit_log (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'));
end;
$$;

revoke all on function public.log_admin_action(text, text, uuid, jsonb) from public;
grant execute on function public.log_admin_action(text, text, uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Create in-app notification (+ respects preferences)
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
        when not np.push_enabled then false
        when p_type = 'new_match' then np.new_matches
        when p_type = 'deadline_reminder' then np.deadline_reminders
        when p_type = 'saved_reminder' then np.saved_reminders
        when p_type in ('mentor_assigned', 'mentee_assigned') then np.mentorship_assignments
        when p_type = 'waiting_list_update' then np.waiting_list_updates
        when p_type = 'session_reminder' then np.session_reminders
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

create or replace function public.create_app_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_dedupe_key text,
  p_opportunity_id uuid default null,
  p_metadata jsonb default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.should_send_notification(p_user_id, p_type) then
    return null;
  end if;

  insert into public.notifications (
    user_id, type, title, body, opportunity_id, dedupe_key, metadata
  )
  values (
    p_user_id, p_type, p_title, p_body, p_opportunity_id, p_dedupe_key, coalesce(p_metadata, '{}')
  )
  on conflict (user_id, dedupe_key) do update
  set
    title = excluded.title,
    body = excluded.body,
    metadata = excluded.metadata,
    read_at = null
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.create_app_notification(uuid, text, text, text, text, uuid, jsonb) from public;
grant execute on function public.create_app_notification(uuid, text, text, text, text, uuid, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- Mentorship notification triggers
-- ---------------------------------------------------------------------------
create or replace function public.notify_mentorship_assigned()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_name text;
  v_mentor_name text;
begin
  if new.status <> 'active' then
    return new;
  end if;

  select coalesce(full_name, 'Student') into v_student_name
  from public.profiles where id = new.student_id;

  select coalesce(full_name, 'Coach') into v_mentor_name
  from public.profiles where id = new.mentor_id;

  perform public.create_app_notification(
    new.student_id,
    'mentor_assigned',
    'Coach assigned',
    format('You have been matched with %s. Mentorship started %s.',
      v_mentor_name, to_char(new.started_at, 'Mon DD, YYYY')),
    'mentorship:assigned:student:' || new.id::text,
    null,
    jsonb_build_object(
      'mentorship_id', new.id,
      'mentor_id', new.mentor_id,
      'assigned_at', new.started_at
    )
  );

  perform public.create_app_notification(
    new.mentor_id,
    'mentee_assigned',
    'New mentee assigned',
    format('%s joined your roster on %s.',
      v_student_name, to_char(new.started_at, 'Mon DD, YYYY')),
    'mentorship:assigned:mentor:' || new.id::text,
    null,
    jsonb_build_object(
      'mentorship_id', new.id,
      'student_id', new.student_id,
      'assigned_at', new.started_at
    )
  );

  return new;
end;
$$;

drop trigger if exists mentorships_notify_assigned on public.mentorships;
create trigger mentorships_notify_assigned
  after insert on public.mentorships
  for each row execute function public.notify_mentorship_assigned();

create or replace function public.notify_waiting_list()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.create_app_notification(
    new.student_id,
    'waiting_list_update',
    'Added to waiting list',
    'You are on the coach waiting list. We will notify you when a compatible coach has capacity.',
    'waiting_list:' || new.request_id::text,
    null,
    jsonb_build_object('request_id', new.request_id, 'entered_at', new.entered_at)
  );
  return new;
end;
$$;

drop trigger if exists waiting_list_notify on public.mentorship_waiting_list;
create trigger waiting_list_notify
  after insert on public.mentorship_waiting_list
  for each row execute function public.notify_waiting_list();

create or replace function public.notify_mentorship_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mentorship public.mentorships%rowtype;
  v_recipient uuid;
  v_sender_name text;
begin
  select * into v_mentorship from public.mentorships where id = new.mentorship_id;

  if v_mentorship.id is null or v_mentorship.status <> 'active' then
    return new;
  end if;

  if new.sender_id = v_mentorship.mentor_id then
    v_recipient := v_mentorship.student_id;
  else
    v_recipient := v_mentorship.mentor_id;
  end if;

  select coalesce(full_name, 'Someone') into v_sender_name
  from public.profiles where id = new.sender_id;

  perform public.create_app_notification(
    v_recipient,
    'mentorship_message',
    'New message from ' || v_sender_name,
    left(new.body, 120),
    'msg:' || new.id::text,
    null,
    jsonb_build_object(
      'mentorship_id', new.mentorship_id,
      'message_id', new.id,
      'sender_id', new.sender_id
    )
  );

  return new;
end;
$$;

drop trigger if exists mentorship_messages_notify on public.mentorship_messages;
create trigger mentorship_messages_notify
  after insert on public.mentorship_messages
  for each row execute function public.notify_mentorship_message();

-- Session reminders (batch; called from cron)
create or replace function public.send_session_reminder_notifications()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
  v_count int := 0;
begin
  for v_row in
    select
      s.id as session_id,
      s.mentorship_id,
      s.scheduled_start,
      s.title,
      m.mentor_id,
      m.student_id
    from public.mentorship_sessions s
    join public.mentorships m on m.id = s.mentorship_id
    where s.status in ('proposed', 'confirmed')
      and s.scheduled_start > now()
      and s.scheduled_start <= now() + interval '24 hours'
  loop
    perform public.create_app_notification(
      v_row.student_id,
      'session_reminder',
      'Session reminder',
      format('"%s" starts %s.',
        coalesce(v_row.title, 'Mentorship session'),
        to_char(v_row.scheduled_start, 'Mon DD at HH24:MI')),
      'session_reminder:student:' || v_row.session_id::text,
      null,
      jsonb_build_object('session_id', v_row.session_id, 'mentorship_id', v_row.mentorship_id)
    );
    perform public.create_app_notification(
      v_row.mentor_id,
      'session_reminder',
      'Session reminder',
      format('"%s" starts %s.',
        coalesce(v_row.title, 'Mentorship session'),
        to_char(v_row.scheduled_start, 'Mon DD at HH24:MI')),
      'session_reminder:mentor:' || v_row.session_id::text,
      null,
      jsonb_build_object('session_id', v_row.session_id, 'mentorship_id', v_row.mentorship_id)
    );
    v_count := v_count + 2;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.send_session_reminder_notifications() from public;
grant execute on function public.send_session_reminder_notifications() to service_role;

-- Update mentor review guard to super admin only
create or replace function public.mentor_profiles_guard_review_fields()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status
    or new.reviewed_at is distinct from old.reviewed_at
    or new.reviewed_by is distinct from old.reviewed_by
    or new.rejection_reason is distinct from old.rejection_reason
  then
    if not public.current_user_is_super_admin() then
      raise exception 'only super admins can change mentor application review fields'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Super Admin RPCs
-- ---------------------------------------------------------------------------
create or replace function public.super_admin_approve_mentor(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_user_is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update public.mentor_profiles
  set
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    rejection_reason = null,
    updated_at = now()
  where user_id = p_user_id;

  perform public.log_admin_action(
    'mentor.approve', 'mentor_profile', p_user_id, '{}'::jsonb
  );

  return jsonb_build_object('ok', true, 'user_id', p_user_id);
end;
$$;

create or replace function public.super_admin_set_mentor_status(
  p_user_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_user_is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if p_status not in ('approved', 'suspended', 'rejected', 'pending') then
    raise exception 'invalid status' using errcode = 'P0013';
  end if;

  update public.mentor_profiles
  set status = p_status, updated_at = now(), reviewed_at = now(), reviewed_by = auth.uid()
  where user_id = p_user_id;

  perform public.log_admin_action(
    'mentor.status_change', 'mentor_profile', p_user_id,
    jsonb_build_object('status', p_status)
  );

  return jsonb_build_object('ok', true);
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
begin
  if not public.current_user_is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if exists (select 1 from public.profiles where id = p_user_id and is_super_admin) then
    raise exception 'cannot change admin flag on super admin account' using errcode = 'P0014';
  end if;

  update public.profiles
  set is_admin = p_is_admin, updated_at = now()
  where id = p_user_id;

  perform public.log_admin_action(
    'admin.set_flag', 'profile', p_user_id,
    jsonb_build_object('is_admin', p_is_admin)
  );

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.super_admin_broadcast_to_mentors(
  p_subject text,
  p_body text,
  p_target_mentor_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_broadcast_id uuid;
  v_count int := 0;
  v_mentor record;
begin
  if not public.current_user_is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  insert into public.mentor_broadcasts (
    sender_id, subject, body, target_type, target_mentor_id
  )
  values (
    auth.uid(),
    trim(p_subject),
    trim(p_body),
    case when p_target_mentor_id is null then 'all_mentors' else 'single_mentor' end,
    p_target_mentor_id
  )
  returning id into v_broadcast_id;

  for v_mentor in
    select mp.user_id
    from public.mentor_profiles mp
    where mp.status = 'approved'
      and (p_target_mentor_id is null or mp.user_id = p_target_mentor_id)
  loop
    perform public.create_app_notification(
      v_mentor.user_id,
      'mentor_broadcast',
      trim(p_subject),
      left(trim(p_body), 200),
      'broadcast:' || v_broadcast_id::text || ':' || v_mentor.user_id::text,
      null,
      jsonb_build_object('broadcast_id', v_broadcast_id)
    );
    v_count := v_count + 1;
  end loop;

  update public.mentor_broadcasts set recipients_count = v_count where id = v_broadcast_id;

  perform public.log_admin_action(
    'mentor.broadcast', 'mentor_broadcast', v_broadcast_id,
    jsonb_build_object('recipients', v_count, 'target_mentor_id', p_target_mentor_id)
  );

  return jsonb_build_object('broadcast_id', v_broadcast_id, 'recipients', v_count);
end;
$$;

create or replace function public.get_super_admin_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_user_is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'mentors', jsonb_build_object(
      'total', (select count(*)::int from public.mentor_profiles),
      'approved', (select count(*)::int from public.mentor_profiles where status = 'approved'),
      'pending', (select count(*)::int from public.mentor_profiles where status = 'pending'),
      'suspended', (select count(*)::int from public.mentor_profiles where status = 'suspended')
    ),
    'mentorships', jsonb_build_object(
      'active', (select count(*)::int from public.mentorships where status = 'active'),
      'total', (select count(*)::int from public.mentorships)
    ),
    'waiting_list', (select count(*)::int from public.mentorship_waiting_list),
    'admins', (select count(*)::int from public.profiles where is_admin),
    'super_admins', (select count(*)::int from public.profiles where is_super_admin),
    'users', (select count(*)::int from public.profiles),
    'opportunities', jsonb_build_object(
      'total', (select count(*)::int from public.opportunities),
      'active', (
        select count(*)::int from public.opportunities where deadline > now()
      ),
      'applied', (select count(*)::int from public.applied_opportunities),
      'saved', (select count(*)::int from public.saved_opportunities)
    ),
    'notifications', jsonb_build_object(
      'pending_push', (
        select count(*)::int from public.notifications where push_sent_at is null
      )
    )
  );
end;
$$;

create or replace function public.get_super_admin_mentors(
  p_search text default null,
  p_status text default null,
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
  from public.mentor_profiles mp
  join public.profiles p on p.id = mp.user_id
  where (p_status is null or mp.status = p_status)
    and (
      p_search is null
      or p.full_name ilike '%' || p_search || '%'
      or p.email ilike '%' || p_search || '%'
    );

  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v_items
  from (
    select
      mp.user_id,
      mp.status,
      mp.bio,
      mp.max_students,
      mp.is_accepting_students,
      mp.applied_at,
      mp.reviewed_at,
      p.full_name,
      p.email,
      public.mentor_active_mentee_count(mp.user_id) as active_mentees
    from public.mentor_profiles mp
    join public.profiles p on p.id = mp.user_id
    where (p_status is null or mp.status = p_status)
      and (
        p_search is null
        or p.full_name ilike '%' || p_search || '%'
        or p.email ilike '%' || p_search || '%'
      )
    order by mp.applied_at desc
    limit greatest(p_limit, 1)
    offset greatest(p_offset, 0)
  ) t;

  return jsonb_build_object('items', v_items, 'total', v_total);
end;
$$;

create or replace function public.get_super_admin_mentees(
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
  where m.status = 'active'
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
      m.ends_at,
      m.student_id,
      m.mentor_id,
      sp.full_name as student_name,
      sp.email as student_email,
      mp_prof.full_name as mentor_name
    from public.mentorships m
    join public.profiles sp on sp.id = m.student_id
    join public.profiles mp_prof on mp_prof.id = m.mentor_id
    where m.status = 'active'
      and (
        p_search is null
        or sp.full_name ilike '%' || p_search || '%'
        or sp.email ilike '%' || p_search || '%'
      )
    order by m.started_at desc
    limit greatest(p_limit, 1)
    offset greatest(p_offset, 0)
  ) t;

  return jsonb_build_object('items', v_items, 'total', v_total);
end;
$$;

create or replace function public.get_super_admin_admins(
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
  from public.profiles p
  where (p.is_admin or p.is_super_admin)
    and (
      p_search is null
      or p.full_name ilike '%' || p_search || '%'
      or p.email ilike '%' || p_search || '%'
    );

  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v_items
  from (
    select
      p.id,
      p.full_name,
      p.email,
      p.is_admin,
      p.is_super_admin,
      p.created_at,
      (
        select count(*)::int from public.admin_audit_log a where a.actor_id = p.id
      ) as audit_actions
    from public.profiles p
    where (p.is_admin or p.is_super_admin)
      and (
        p_search is null
        or p.full_name ilike '%' || p_search || '%'
        or p.email ilike '%' || p_search || '%'
      )
    order by p.created_at desc
    limit greatest(p_limit, 1)
    offset greatest(p_offset, 0)
  ) t;

  return jsonb_build_object('items', v_items, 'total', v_total);
end;
$$;

create or replace function public.get_super_admin_opportunities_analytics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_user_is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return public.get_admin_analytics()::jsonb;
end;
$$;

create or replace function public.super_admin_promote_admin_by_email(
  p_email text,
  p_is_admin boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if not public.current_user_is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select id into v_user_id from public.profiles where lower(email) = lower(trim(p_email)) limit 1;

  if v_user_id is null then
    raise exception 'user not found for email' using errcode = 'P0015';
  end if;

  return public.super_admin_set_admin(v_user_id, p_is_admin);
end;
$$;

grant execute on function public.super_admin_promote_admin_by_email(text, boolean) to authenticated;

-- Super admins may also read opportunity admin analytics
create or replace function public.get_admin_analytics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not (public.current_user_is_admin() or public.current_user_is_super_admin()) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'users', jsonb_build_object(
      'total', (select count(*)::int from public.profiles),
      'new_this_week', (
        select count(*)::int from public.profiles
        where created_at >= date_trunc('week', now())
      ),
      'new_this_month', (
        select count(*)::int from public.profiles
        where created_at >= date_trunc('month', now())
      ),
      'onboarding_complete', (
        select count(*)::int from public.profiles where onboarding_complete = true
      ),
      'onboarding_incomplete', (
        select count(*)::int from public.profiles where onboarding_complete = false
      )
    ),
    'opportunities', jsonb_build_object(
      'total', (select count(*)::int from public.opportunities),
      'closing_in_7_days', (
        select count(*)::int from public.opportunities
        where deadline > now()
          and deadline <= now() + interval '7 days'
      ),
      'by_category', coalesce((
        select jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc)
        from (
          select coalesce(nullif(trim(category), ''), 'Unknown') as label, count(*)::int as value
          from public.opportunities
          group by 1
          order by value desc
        ) t
      ), '[]'::jsonb),
      'by_country', coalesce((
        select jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc)
        from (
          select coalesce(nullif(trim(country), ''), 'Unknown') as label, count(*)::int as value
          from public.opportunities
          group by 1
          order by value desc
        ) t
      ), '[]'::jsonb),
      'by_funding_type', coalesce((
        select jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc)
        from (
          select coalesce(nullif(trim(funding_type), ''), 'Unknown') as label, count(*)::int as value
          from public.opportunities
          group by 1
          order by value desc
        ) t
      ), '[]'::jsonb)
    ),
    'engagement', jsonb_build_object(
      'total_saves', (select count(*)::int from public.saved_opportunities),
      'total_applied', (select count(*)::int from public.applied_opportunities),
      'top_saved', coalesce((
        select jsonb_agg(jsonb_build_object(
          'opportunity_id', opportunity_id,
          'title', title,
          'count', cnt
        ) order by cnt desc)
        from (
          select s.opportunity_id, o.title, count(*)::int as cnt
          from public.saved_opportunities s
          join public.opportunities o on o.id = s.opportunity_id
          group by s.opportunity_id, o.title
          order by cnt desc
          limit 5
        ) t
      ), '[]'::jsonb),
      'top_applied', coalesce((
        select jsonb_agg(jsonb_build_object(
          'opportunity_id', opportunity_id,
          'title', title,
          'count', cnt
        ) order by cnt desc)
        from (
          select a.opportunity_id, o.title, count(*)::int as cnt
          from public.applied_opportunities a
          join public.opportunities o on o.id = a.opportunity_id
          group by a.opportunity_id, o.title
          order by cnt desc
          limit 5
        ) t
      ), '[]'::jsonb)
    ),
    'notifications', jsonb_build_object(
      'total_sent', (select count(*)::int from public.notifications),
      'total_unread', (
        select count(*)::int from public.notifications where read_at is null
      )
    )
  ) into result;

  return result;
end;
$$;

-- Grants
grant execute on function public.super_admin_approve_mentor(uuid) to authenticated;
grant execute on function public.super_admin_set_mentor_status(uuid, text) to authenticated;
grant execute on function public.super_admin_set_admin(uuid, boolean) to authenticated;
grant execute on function public.super_admin_broadcast_to_mentors(text, text, uuid) to authenticated;
grant execute on function public.get_super_admin_overview() to authenticated;
grant execute on function public.get_super_admin_mentors(text, text, int, int) to authenticated;
grant execute on function public.get_super_admin_mentees(text, int, int) to authenticated;
grant execute on function public.get_super_admin_admins(text, int, int) to authenticated;
grant execute on function public.get_super_admin_opportunities_analytics() to authenticated;
