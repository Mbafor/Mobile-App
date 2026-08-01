-- Mentorship messaging notifications: LinkedIn-style delayed "new message" email
-- (Trigger 1) and stale-thread nudge emails at 48h/7d (Trigger 2).
--
-- mentorship_participant_state.last_read_at already existed (013_mentorship.sql)
-- but nothing ever wrote to it -- mark_mentorship_read() is what the client now
-- calls so Trigger 1 has something real to check "has this been read yet?" against.

-- ---------------------------------------------------------------------------
-- mark_mentorship_read: upsert the caller's read cursor for a mentorship thread
-- ---------------------------------------------------------------------------
create or replace function public.mark_mentorship_read(p_mentorship_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.mentorship_participant_state (mentorship_id, user_id, last_read_at, last_active_at)
  values (p_mentorship_id, auth.uid(), now(), now())
  on conflict (mentorship_id, user_id)
  do update set
    last_read_at = excluded.last_read_at,
    last_active_at = excluded.last_active_at;
$$;

revoke all on function public.mark_mentorship_read(uuid) from public;
grant execute on function public.mark_mentorship_read(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- notification_log: dedupe guard for both triggers across overlapping cron runs
-- ---------------------------------------------------------------------------
create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  mentorship_id uuid not null references public.mentorships (id) on delete cascade,
  message_id uuid references public.mentorship_messages (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  notification_type text not null
    check (notification_type in ('new_message', 'nudge_48h', 'nudge_7d')),
  created_at timestamptz not null default now()
);

-- Trigger 1: one logged send per (batch-head message, recipient). The edge
-- function always logs message_id = the latest message in the batch it just
-- emailed, so a later batch (a new message_id) is free to send again.
create unique index if not exists notification_log_new_message_unique
  on public.notification_log (message_id, recipient_id)
  where notification_type = 'new_message';

-- Trigger 2: one nudge per threshold per conversation, ever -- matches the
-- product requirement literally (not per-recipient, so it can't flip-flop and
-- re-fire if responsibility for the unanswered message switches sides later).
create unique index if not exists notification_log_nudge_unique
  on public.notification_log (mentorship_id, notification_type)
  where notification_type in ('nudge_48h', 'nudge_7d');

create index if not exists notification_log_mentorship_idx
  on public.notification_log (mentorship_id, notification_type);

alter table public.notification_log enable row level security;
-- No policies: only the service role (edge functions) touches this table.

-- ---------------------------------------------------------------------------
-- get_unread_message_candidates: individual unread messages eligible for a
-- Trigger-1 email (past the delay window, unread, not yet covered by a prior
-- new_message notification). The edge function groups these by
-- (mentorship_id, sender_id) to build one batched email per sender.
-- ---------------------------------------------------------------------------
create or replace function public.get_unread_message_candidates(p_delay_minutes int default 15)
returns table (
  message_id uuid,
  mentorship_id uuid,
  sender_id uuid,
  sender_name text,
  recipient_id uuid,
  recipient_email text,
  recipient_name text,
  body text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.id as message_id,
    m.mentorship_id,
    m.sender_id,
    coalesce(sp.full_name, 'Your mentor') as sender_name,
    recipient.user_id as recipient_id,
    rp.email as recipient_email,
    coalesce(rp.full_name, 'there') as recipient_name,
    m.body,
    m.created_at
  from public.mentorship_messages m
  join public.mentorships ms on ms.id = m.mentorship_id
  join public.mentorship_participant_state recipient
    on recipient.mentorship_id = m.mentorship_id
    and recipient.user_id = case
      when m.sender_id = ms.mentor_id then ms.student_id
      else ms.mentor_id
    end
  join public.profiles sp on sp.id = m.sender_id
  join public.profiles rp on rp.id = recipient.user_id
  where ms.status = 'active'
    and m.created_at <= now() - make_interval(mins => p_delay_minutes)
    and (recipient.last_read_at is null or recipient.last_read_at < m.created_at)
    and rp.email is not null
    and not exists (
      select 1
      from public.notification_log nl
      join public.mentorship_messages head on head.id = nl.message_id
      where nl.notification_type = 'new_message'
        and nl.recipient_id = recipient.user_id
        and nl.mentorship_id = m.mentorship_id
        and head.created_at >= m.created_at
    )
  order by m.mentorship_id, m.sender_id, m.created_at;
$$;

revoke all on function public.get_unread_message_candidates(int) from public;
grant execute on function public.get_unread_message_candidates(int) to service_role;

-- ---------------------------------------------------------------------------
-- get_stale_thread_nudge_candidates: conversations whose last message has
-- gone unanswered past p_hours, with no nudge of p_notification_type logged
-- yet for that conversation.
-- ---------------------------------------------------------------------------
create or replace function public.get_stale_thread_nudge_candidates(
  p_hours int,
  p_notification_type text
)
returns table (
  mentorship_id uuid,
  last_message_id uuid,
  last_message_created_at timestamptz,
  sender_id uuid,
  sender_name text,
  recipient_id uuid,
  recipient_email text,
  recipient_name text,
  hours_waiting numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with last_messages as (
    select distinct on (m.mentorship_id)
      m.id as message_id,
      m.mentorship_id,
      m.sender_id,
      m.created_at
    from public.mentorship_messages m
    order by m.mentorship_id, m.created_at desc
  )
  select
    lm.mentorship_id,
    lm.message_id as last_message_id,
    lm.created_at as last_message_created_at,
    lm.sender_id,
    coalesce(sp.full_name, 'Your mentor') as sender_name,
    recip.user_id as recipient_id,
    rp.email as recipient_email,
    coalesce(rp.full_name, 'there') as recipient_name,
    round((extract(epoch from (now() - lm.created_at)) / 3600.0)::numeric, 1) as hours_waiting
  from last_messages lm
  join public.mentorships ms on ms.id = lm.mentorship_id
  join public.mentorship_participant_state recip
    on recip.mentorship_id = lm.mentorship_id
    and recip.user_id = case
      when lm.sender_id = ms.mentor_id then ms.student_id
      else ms.mentor_id
    end
  join public.profiles sp on sp.id = lm.sender_id
  join public.profiles rp on rp.id = recip.user_id
  where ms.status = 'active'
    and lm.created_at <= now() - make_interval(hours => p_hours)
    and rp.email is not null
    and not exists (
      select 1
      from public.notification_log nl
      where nl.notification_type = p_notification_type
        and nl.mentorship_id = lm.mentorship_id
    );
$$;

revoke all on function public.get_stale_thread_nudge_candidates(int, text) from public;
grant execute on function public.get_stale_thread_nudge_candidates(int, text) to service_role;

-- ---------------------------------------------------------------------------
-- log_notification_send: race-safe "claim" of a notification send. Returns
-- true only if this call actually inserted the row (i.e. this run won the
-- race and should send the email); false means another concurrent cron run
-- already logged it. Both ON CONFLICT clauses target the partial unique
-- indexes above -- Postgres conflict inference requires the WHERE predicate
-- to match the index exactly, which the Supabase JS client's upsert() can't
-- express, so this goes through a dedicated RPC instead.
-- ---------------------------------------------------------------------------
create or replace function public.log_notification_send(
  p_mentorship_id uuid,
  p_message_id uuid,
  p_recipient_id uuid,
  p_sender_id uuid,
  p_notification_type text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if p_notification_type = 'new_message' then
    insert into public.notification_log (mentorship_id, message_id, recipient_id, sender_id, notification_type)
    values (p_mentorship_id, p_message_id, p_recipient_id, p_sender_id, p_notification_type)
    on conflict (message_id, recipient_id) where notification_type = 'new_message' do nothing;
  elsif p_notification_type in ('nudge_48h', 'nudge_7d') then
    insert into public.notification_log (mentorship_id, message_id, recipient_id, sender_id, notification_type)
    values (p_mentorship_id, p_message_id, p_recipient_id, p_sender_id, p_notification_type)
    on conflict (mentorship_id, notification_type) where notification_type in ('nudge_48h', 'nudge_7d') do nothing;
  else
    raise exception 'unknown notification_type: %', p_notification_type;
  end if;

  get diagnostics v_count = row_count;
  return v_count > 0;
end;
$$;

revoke all on function public.log_notification_send(uuid, uuid, uuid, uuid, text) from public;
grant execute on function public.log_notification_send(uuid, uuid, uuid, uuid, text) to service_role;
