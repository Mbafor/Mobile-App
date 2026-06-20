-- Fix session notification metadata and add mentorship maintenance RPC.
-- 1. Include session_time + other_party_name in session_booked / session_confirmed metadata
--    so send-session-booking-emails can populate the info box.
-- 2. Add create_session_reminder_notifications() to generate 15-min reminders.
-- 3. Add run_mentorship_maintenance() that the mentorship-maintenance edge function calls
--    (previously called but never defined).

-- ---------------------------------------------------------------------------
-- 1. notify_session_booked — add session_time + other_party_name
-- ---------------------------------------------------------------------------
create or replace function public.notify_session_booked()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_name text;
  v_coach_name text;
begin
  if new.status not in ('pending', 'proposed') or new.created_by <> new.student_id then
    return new;
  end if;

  select coalesce(nullif(trim(p.full_name), ''), 'A student')
  into v_student_name
  from public.profiles p
  where p.id = new.student_id;

  select coalesce(nullif(trim(p.full_name), ''), 'Your coach')
  into v_coach_name
  from public.profiles p
  where p.id = new.coach_id;

  -- Notify coach: tell them who booked and when
  perform public.create_app_notification(
    new.coach_id,
    'session_booked',
    'New session booking',
    format('%s booked a session on %s.',
      v_student_name,
      to_char(new.scheduled_start, 'Dy Mon DD at HH24:MI')),
    'session_booked:coach:' || new.id::text,
    null,
    jsonb_build_object(
      'session_id',        new.id,
      'mentorship_id',     new.mentorship_id,
      'student_id',        new.student_id,
      'meeting_url',       new.meeting_url,
      'session_time',      new.scheduled_start,
      'other_party_name',  v_student_name
    )
  );

  -- Notify student: confirm the request was sent
  perform public.create_app_notification(
    new.student_id,
    'session_booked',
    'Booking received',
    format('Your session request with %s on %s has been sent. The join link is ready.',
      v_coach_name,
      to_char(new.scheduled_start, 'Dy Mon DD at HH24:MI')),
    'session_booked:student:' || new.id::text,
    null,
    jsonb_build_object(
      'session_id',        new.id,
      'mentorship_id',     new.mentorship_id,
      'coach_id',          new.coach_id,
      'meeting_url',       new.meeting_url,
      'session_time',      new.scheduled_start,
      'other_party_name',  v_coach_name
    )
  );

  return new;
end;
$$;

drop trigger if exists mentorship_sessions_notify_booked on public.mentorship_sessions;
create trigger mentorship_sessions_notify_booked
  after insert on public.mentorship_sessions
  for each row execute function public.notify_session_booked();

-- ---------------------------------------------------------------------------
-- 2. notify_session_confirmed — add session_time + other_party_name
-- ---------------------------------------------------------------------------
create or replace function public.notify_session_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_name text;
  v_coach_name text;
begin
  if new.status = 'confirmed'
    and old.status is distinct from 'confirmed'
    and new.meeting_url is not null
  then
    select coalesce(nullif(trim(p.full_name), ''), 'A student')
    into v_student_name
    from public.profiles p
    where p.id = new.student_id;

    select coalesce(nullif(trim(p.full_name), ''), 'Your coach')
    into v_coach_name
    from public.profiles p
    where p.id = new.coach_id;

    perform public.create_app_notification(
      new.student_id,
      'session_booked',
      'Session confirmed',
      format('Your session on %s is confirmed. Tap to open the session link.',
        to_char(new.scheduled_start, 'Dy Mon DD at HH24:MI')),
      'session_confirmed:student:' || new.id::text,
      null,
      jsonb_build_object(
        'session_id',        new.id,
        'mentorship_id',     new.mentorship_id,
        'meeting_url',       new.meeting_url,
        'session_time',      new.scheduled_start,
        'other_party_name',  v_coach_name
      )
    );

    perform public.create_app_notification(
      new.coach_id,
      'session_booked',
      'Session confirmed',
      format('Your session on %s is confirmed. Session link is ready.',
        to_char(new.scheduled_start, 'Dy Mon DD at HH24:MI')),
      'session_confirmed:coach:' || new.id::text,
      null,
      jsonb_build_object(
        'session_id',        new.id,
        'mentorship_id',     new.mentorship_id,
        'meeting_url',       new.meeting_url,
        'session_time',      new.scheduled_start,
        'other_party_name',  v_student_name
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists mentorship_sessions_notify_confirmed on public.mentorship_sessions;
create trigger mentorship_sessions_notify_confirmed
  after update on public.mentorship_sessions
  for each row execute function public.notify_session_confirmed();

-- ---------------------------------------------------------------------------
-- 3. create_session_reminder_notifications
--    Called by run_mentorship_maintenance(). Finds sessions starting in the
--    next 14-16 minutes and creates session_reminder notifications for both
--    parties, deduped by (type, metadata session_id).
-- ---------------------------------------------------------------------------
create or replace function public.create_session_reminder_notifications()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count    int := 0;
  v_session  record;
  v_student_name text;
  v_coach_name   text;
begin
  for v_session in
    select s.id, s.student_id, s.coach_id, s.scheduled_start, s.meeting_url
    from public.mentorship_sessions s
    where s.status in ('pending', 'confirmed')
      and s.scheduled_start between now() + interval '14 minutes'
                                and now() + interval '16 minutes'
      and not exists (
        select 1 from public.notifications n
        where n.type = 'session_reminder'
          and (n.metadata->>'session_id') = s.id::text
          and n.user_id = s.student_id
      )
  loop
    select coalesce(nullif(trim(p.full_name), ''), 'Your student')
    into v_student_name
    from public.profiles p where p.id = v_session.student_id;

    select coalesce(nullif(trim(p.full_name), ''), 'Your coach')
    into v_coach_name
    from public.profiles p where p.id = v_session.coach_id;

    perform public.create_app_notification(
      v_session.student_id,
      'session_reminder',
      'Session in 15 minutes',
      format('Your session with %s starts in 15 minutes.', v_coach_name),
      'session_reminder:student:' || v_session.id::text,
      null,
      jsonb_build_object(
        'session_id',        v_session.id,
        'session_time',      v_session.scheduled_start,
        'other_party_name',  v_coach_name,
        'meeting_url',       v_session.meeting_url
      )
    );

    perform public.create_app_notification(
      v_session.coach_id,
      'session_reminder',
      'Session in 15 minutes',
      format('Your session with %s starts in 15 minutes.', v_student_name),
      'session_reminder:coach:' || v_session.id::text,
      null,
      jsonb_build_object(
        'session_id',        v_session.id,
        'session_time',      v_session.scheduled_start,
        'other_party_name',  v_student_name,
        'meeting_url',       v_session.meeting_url
      )
    );

    v_count := v_count + 2;
  end loop;

  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. run_mentorship_maintenance
--    Called by the mentorship-maintenance edge function (which was calling
--    this RPC but it was never defined, causing 500 errors).
-- ---------------------------------------------------------------------------
create or replace function public.run_mentorship_maintenance()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reminder_count int;
begin
  v_reminder_count := public.create_session_reminder_notifications();

  return jsonb_build_object(
    'session_reminders_created', v_reminder_count
  );
end;
$$;

grant execute on function public.run_mentorship_maintenance()             to service_role;
grant execute on function public.create_session_reminder_notifications() to service_role;
