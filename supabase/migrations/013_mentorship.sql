-- Mentorship: coach applications, student requests, waiting list, active mentorships,
-- messaging, and session scheduling.
-- Coaches are approved by platform admins (profiles.is_admin). Max 10 active mentees
-- per coach; mentorship duration capped at 3 months.

-- ---------------------------------------------------------------------------
-- Constants (enforced in triggers / checks)
-- ---------------------------------------------------------------------------
-- max active mentees per coach: 10
-- max mentorship duration: 3 months

-- ---------------------------------------------------------------------------
-- mentor_profiles (coach application + approved coach record)
-- ---------------------------------------------------------------------------
create table if not exists public.mentor_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'suspended')),
  bio text,
  -- Explicit matching criteria (overlaps with profiles.* for match scoring)
  mentoring_majors text[] not null default '{}',
  mentoring_interests text[] not null default '{}',
  mentoring_career_areas text[] not null default '{}',
  mentoring_degree_levels text[] not null default '{}',
  max_students int not null default 10
    check (max_students > 0 and max_students <= 10),
  is_accepting_students boolean not null default true,
  applied_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mentor_profiles_status_idx
  on public.mentor_profiles (status)
  where status = 'approved';

-- ---------------------------------------------------------------------------
-- mentorship_requests (student-initiated; not auto-assigned)
-- ---------------------------------------------------------------------------
create table if not exists public.mentorship_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in (
      'pending',       -- submitted, awaiting match attempt
      'waiting_list',  -- no compatible coach with capacity
      'matched',       -- fulfilled; mentorship created
      'cancelled'      -- student cancelled before match
    )),
  requested_mentor_id uuid references auth.users (id) on delete set null,
  -- Snapshot of student profile fields used for matching (immutable audit)
  match_snapshot jsonb not null default '{}',
  match_score numeric(5, 2),
  matched_mentor_id uuid references auth.users (id) on delete set null,
  matched_at timestamptz,
  mentorship_id uuid,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mentorship_requests_student_idx
  on public.mentorship_requests (student_id, created_at desc);

create index if not exists mentorship_requests_status_idx
  on public.mentorship_requests (status, created_at)
  where status in ('pending', 'waiting_list');

-- One open request per student (pending or waiting_list)
create unique index if not exists mentorship_requests_one_open_per_student
  on public.mentorship_requests (student_id)
  where status in ('pending', 'waiting_list');

-- ---------------------------------------------------------------------------
-- mentorship_waiting_list (FIFO queue when no coach slot available)
-- ---------------------------------------------------------------------------
create table if not exists public.mentorship_waiting_list (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.mentorship_requests (id) on delete cascade,
  student_id uuid not null references auth.users (id) on delete cascade,
  entered_at timestamptz not null default now(),
  priority int not null default 0
);

create index if not exists mentorship_waiting_list_queue_idx
  on public.mentorship_waiting_list (priority desc, entered_at asc);

-- ---------------------------------------------------------------------------
-- mentorships (active coach–student relationship)
-- ---------------------------------------------------------------------------
create table if not exists public.mentorships (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references auth.users (id) on delete cascade,
  student_id uuid not null references auth.users (id) on delete cascade,
  request_id uuid references public.mentorship_requests (id) on delete set null,
  status text not null default 'active'
    check (status in (
      'active',
      'ended',              -- natural completion (e.g. reached end date)
      'expired',            -- passed 3-month cap
      'removed_by_mentor',  -- coach removed inactive student
      'left_by_student'     -- voluntary exit
    )),
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  ended_at timestamptz,
  end_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (mentor_id <> student_id)
);

-- Link request → mentorship after match (deferred FK)
alter table public.mentorship_requests
  add constraint mentorship_requests_mentorship_id_fkey
  foreign key (mentorship_id) references public.mentorships (id) on delete set null;

create index if not exists mentorships_mentor_idx
  on public.mentorships (mentor_id, status);

create index if not exists mentorships_student_idx
  on public.mentorships (student_id, status);

-- One active mentorship per student at a time
create unique index if not exists mentorships_one_active_per_student
  on public.mentorships (student_id)
  where status = 'active';

-- ---------------------------------------------------------------------------
-- mentor_availability_rules (recurring weekly windows)
-- ---------------------------------------------------------------------------
create table if not exists public.mentor_availability_rules (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references auth.users (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  timezone text not null default 'UTC',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_time < end_time)
);

create index if not exists mentor_availability_rules_mentor_idx
  on public.mentor_availability_rules (mentor_id)
  where is_active;

-- ---------------------------------------------------------------------------
-- mentorship_sessions (scheduled meetings)
-- ---------------------------------------------------------------------------
create table if not exists public.mentorship_sessions (
  id uuid primary key default gen_random_uuid(),
  mentorship_id uuid not null references public.mentorships (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  timezone text not null default 'UTC',
  status text not null default 'proposed'
    check (status in ('proposed', 'confirmed', 'completed', 'cancelled')),
  title text,
  notes text,
  meeting_url text,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (scheduled_start < scheduled_end)
);

create index if not exists mentorship_sessions_mentorship_idx
  on public.mentorship_sessions (mentorship_id, scheduled_start);

-- ---------------------------------------------------------------------------
-- mentorship_messages (private coach ↔ student thread per mentorship)
-- ---------------------------------------------------------------------------
create table if not exists public.mentorship_messages (
  id uuid primary key default gen_random_uuid(),
  mentorship_id uuid not null references public.mentorships (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists mentorship_messages_mentorship_idx
  on public.mentorship_messages (mentorship_id, created_at);

-- Per-participant read cursor (for unread counts + inactive detection)
create table if not exists public.mentorship_participant_state (
  mentorship_id uuid not null references public.mentorships (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  last_read_at timestamptz,
  last_active_at timestamptz not null default now(),
  primary key (mentorship_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------
create or replace function public.current_user_is_approved_mentor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.mentor_profiles mp
    where mp.user_id = auth.uid()
      and mp.status = 'approved'
  );
$$;

create or replace function public.mentor_active_mentee_count(p_mentor_id uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.mentorships m
  where m.mentor_id = p_mentor_id
    and m.status = 'active';
$$;

create or replace function public.user_is_mentorship_participant(
  p_mentorship_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.mentorships m
    where m.id = p_mentorship_id
      and (m.mentor_id = p_user_id or m.student_id = p_user_id)
  );
$$;

-- Compatibility score 0–100 from profile overlap (used by app / edge functions)
create or replace function public.mentorship_match_score(
  p_student_id uuid,
  p_mentor_id uuid
)
returns numeric
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_student public.profiles%rowtype;
  v_mentor_profile public.mentor_profiles%rowtype;
  v_mentor_user public.profiles%rowtype;
  v_score numeric := 0;
  v_factors int := 0;
begin
  select * into v_student from public.profiles where id = p_student_id;
  select * into v_mentor_profile from public.mentor_profiles where user_id = p_mentor_id;
  select * into v_mentor_user from public.profiles where id = p_mentor_id;

  if v_student.id is null or v_mentor_profile.user_id is null or v_mentor_user.id is null then
    return 0;
  end if;

  if v_mentor_profile.status <> 'approved' then
    return 0;
  end if;

  -- Major (25)
  v_factors := v_factors + 1;
  if v_student.course_major is not null
    and (
      v_student.course_major = any (v_mentor_profile.mentoring_majors)
      or v_student.course_major = v_mentor_user.course_major
    )
  then
    v_score := v_score + 25;
  end if;

  -- Degree level (15)
  v_factors := v_factors + 1;
  if v_student.degree_level is not null
    and (
      v_student.degree_level = any (v_mentor_profile.mentoring_degree_levels)
      or v_student.degree_level = v_mentor_user.degree_level
    )
  then
    v_score := v_score + 15;
  end if;

  -- Interests overlap (30)
  v_factors := v_factors + 1;
  if cardinality(v_student.interests) > 0
    and (
      v_student.interests && v_mentor_profile.mentoring_interests
      or v_student.interests && v_mentor_user.interests
    )
  then
    v_score := v_score + 30;
  end if;

  -- Career interests overlap (30)
  v_factors := v_factors + 1;
  if cardinality(v_student.career_interests) > 0
    and (
      v_student.career_interests && v_mentor_profile.mentoring_career_areas
      or v_student.career_interests && v_mentor_user.career_interests
    )
  then
    v_score := v_score + 30;
  end if;

  return least(v_score, 100);
end;
$$;

-- ---------------------------------------------------------------------------
-- Triggers: updated_at, mentorship end date, capacity guard
-- ---------------------------------------------------------------------------
drop trigger if exists mentor_profiles_updated_at on public.mentor_profiles;
create trigger mentor_profiles_updated_at
  before update on public.mentor_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists mentorship_requests_updated_at on public.mentorship_requests;
create trigger mentorship_requests_updated_at
  before update on public.mentorship_requests
  for each row execute function public.set_updated_at();

drop trigger if exists mentorships_updated_at on public.mentorships;
create trigger mentorships_updated_at
  before update on public.mentorships
  for each row execute function public.set_updated_at();

drop trigger if exists mentor_availability_rules_updated_at on public.mentor_availability_rules;
create trigger mentor_availability_rules_updated_at
  before update on public.mentor_availability_rules
  for each row execute function public.set_updated_at();

drop trigger if exists mentorship_sessions_updated_at on public.mentorship_sessions;
create trigger mentorship_sessions_updated_at
  before update on public.mentorship_sessions
  for each row execute function public.set_updated_at();

create or replace function public.mentorships_set_ends_at()
returns trigger
language plpgsql
as $$
begin
  if new.ends_at is null or new.ends_at = new.started_at then
    new.ends_at := new.started_at + interval '3 months';
  end if;
  return new;
end;
$$;

drop trigger if exists mentorships_set_ends_at on public.mentorships;
create trigger mentorships_set_ends_at
  before insert on public.mentorships
  for each row execute function public.mentorships_set_ends_at();

create or replace function public.mentorships_enforce_mentor_capacity()
returns trigger
language plpgsql
as $$
declare
  v_max int;
  v_active int;
begin
  if new.status <> 'active' then
    return new;
  end if;

  select mp.max_students into v_max
  from public.mentor_profiles mp
  where mp.user_id = new.mentor_id
    and mp.status = 'approved';

  if v_max is null then
    raise exception 'mentor is not approved' using errcode = '23514';
  end if;

  select public.mentor_active_mentee_count(new.mentor_id) into v_active;

  if tg_op = 'INSERT' and v_active >= v_max then
    raise exception 'mentor has reached maximum active students (%)', v_max
      using errcode = '23514';
  end if;

  if tg_op = 'UPDATE' and old.status <> 'active' and new.status = 'active' then
    if v_active >= v_max then
      raise exception 'mentor has reached maximum active students (%)', v_max
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists mentorships_enforce_mentor_capacity on public.mentorships;
create trigger mentorships_enforce_mentor_capacity
  before insert or update on public.mentorships
  for each row execute function public.mentorships_enforce_mentor_capacity();

-- Auto-expire active mentorships past ends_at on update/read paths via app;
-- DB helper to mark expired in batch (callable by cron / edge function)
create or replace function public.expire_due_mentorships()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  update public.mentorships
  set
    status = 'expired',
    ended_at = now(),
    end_reason = coalesce(end_reason, 'Maximum 3-month mentorship period ended'),
    updated_at = now()
  where status = 'active'
    and ends_at <= now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Seed participant state rows when mentorship becomes active
create or replace function public.mentorships_seed_participant_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'active' then
    insert into public.mentorship_participant_state (mentorship_id, user_id)
    values
      (new.id, new.mentor_id),
      (new.id, new.student_id)
    on conflict (mentorship_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists mentorships_seed_participant_state on public.mentorships;
create trigger mentorships_seed_participant_state
  after insert or update on public.mentorships
  for each row execute function public.mentorships_seed_participant_state();

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
    if not public.current_user_is_admin() then
      raise exception 'only admins can change mentor application review fields'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists mentor_profiles_guard_review_fields on public.mentor_profiles;
create trigger mentor_profiles_guard_review_fields
  before update on public.mentor_profiles
  for each row execute function public.mentor_profiles_guard_review_fields();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.mentor_profiles enable row level security;
alter table public.mentorship_requests enable row level security;
alter table public.mentorship_waiting_list enable row level security;
alter table public.mentorships enable row level security;
alter table public.mentor_availability_rules enable row level security;
alter table public.mentorship_sessions enable row level security;
alter table public.mentorship_messages enable row level security;
alter table public.mentorship_participant_state enable row level security;

-- mentor_profiles
create policy "Users read own mentor profile"
  on public.mentor_profiles for select
  using (auth.uid() = user_id or public.current_user_is_admin());

create policy "Approved mentors are visible to authenticated users"
  on public.mentor_profiles for select
  to authenticated
  using (status = 'approved');

create policy "Users apply as mentor"
  on public.mentor_profiles for insert
  with check (
    auth.uid() = user_id
    and status = 'pending'
  );

create policy "Users update own pending mentor profile"
  on public.mentor_profiles for update
  using (auth.uid() = user_id and status in ('pending', 'approved'))
  with check (auth.uid() = user_id);

create policy "Admins review mentor applications"
  on public.mentor_profiles for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

-- mentorship_requests
create policy "Students read own mentorship requests"
  on public.mentorship_requests for select
  using (
    auth.uid() = student_id
    or public.current_user_is_admin()
    or auth.uid() = matched_mentor_id
    or auth.uid() = requested_mentor_id
  );

create policy "Students create mentorship requests"
  on public.mentorship_requests for insert
  with check (
    auth.uid() = student_id
    and status = 'pending'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.onboarding_complete = true
    )
  );

create policy "Students cancel open mentorship requests"
  on public.mentorship_requests for update
  using (auth.uid() = student_id and status in ('pending', 'waiting_list'))
  with check (auth.uid() = student_id);

create policy "Admins manage mentorship requests"
  on public.mentorship_requests for all
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

-- mentorship_waiting_list
create policy "Students read own waiting list entry"
  on public.mentorship_waiting_list for select
  using (auth.uid() = student_id or public.current_user_is_admin());

create policy "Admins manage waiting list"
  on public.mentorship_waiting_list for all
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

-- mentorships
create policy "Participants read own mentorships"
  on public.mentorships for select
  using (
    auth.uid() = mentor_id
    or auth.uid() = student_id
    or public.current_user_is_admin()
  );

create policy "Admins insert mentorships"
  on public.mentorships for insert
  to authenticated
  with check (public.current_user_is_admin());

create policy "Participants update own mentorships"
  on public.mentorships for update
  using (
    auth.uid() = mentor_id
    or auth.uid() = student_id
    or public.current_user_is_admin()
  )
  with check (
    auth.uid() = mentor_id
    or auth.uid() = student_id
    or public.current_user_is_admin()
  );

-- mentor_availability_rules
create policy "Mentors manage own availability"
  on public.mentor_availability_rules for all
  using (
    auth.uid() = mentor_id
    and public.current_user_is_approved_mentor()
  )
  with check (
    auth.uid() = mentor_id
    and public.current_user_is_approved_mentor()
  );

create policy "Mentees read mentor availability"
  on public.mentor_availability_rules for select
  using (
    exists (
      select 1
      from public.mentorships m
      where m.mentor_id = mentor_availability_rules.mentor_id
        and m.student_id = auth.uid()
        and m.status = 'active'
    )
    or auth.uid() = mentor_id
    or public.current_user_is_admin()
  );

-- mentorship_sessions
create policy "Participants read mentorship sessions"
  on public.mentorship_sessions for select
  using (public.user_is_mentorship_participant(mentorship_id) or public.current_user_is_admin());

create policy "Participants manage mentorship sessions"
  on public.mentorship_sessions for insert
  with check (
    public.user_is_mentorship_participant(mentorship_id)
    and auth.uid() = created_by
  );

create policy "Participants update mentorship sessions"
  on public.mentorship_sessions for update
  using (public.user_is_mentorship_participant(mentorship_id) or public.current_user_is_admin())
  with check (public.user_is_mentorship_participant(mentorship_id) or public.current_user_is_admin());

-- mentorship_messages
create policy "Participants read mentorship messages"
  on public.mentorship_messages for select
  using (public.user_is_mentorship_participant(mentorship_id) or public.current_user_is_admin());

create policy "Participants send mentorship messages"
  on public.mentorship_messages for insert
  with check (
    auth.uid() = sender_id
    and public.user_is_mentorship_participant(mentorship_id)
    and exists (
      select 1 from public.mentorships m
      where m.id = mentorship_id
        and m.status = 'active'
    )
  );

-- mentorship_participant_state
create policy "Participants read own mentorship state"
  on public.mentorship_participant_state for select
  using (
    auth.uid() = user_id
    or public.user_is_mentorship_participant(mentorship_id)
    or public.current_user_is_admin()
  );

create policy "Participants update own mentorship state"
  on public.mentorship_participant_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "System inserts participant state via trigger"
  on public.mentorship_participant_state for insert
  with check (public.user_is_mentorship_participant(mentorship_id) or public.current_user_is_admin());

-- ---------------------------------------------------------------------------
-- Grants for helper functions
-- ---------------------------------------------------------------------------
revoke all on function public.current_user_is_approved_mentor() from public;
grant execute on function public.current_user_is_approved_mentor() to authenticated;

revoke all on function public.mentor_active_mentee_count(uuid) from public;
grant execute on function public.mentor_active_mentee_count(uuid) to authenticated;

revoke all on function public.user_is_mentorship_participant(uuid, uuid) from public;
grant execute on function public.user_is_mentorship_participant(uuid, uuid) to authenticated;

revoke all on function public.mentorship_match_score(uuid, uuid) from public;
grant execute on function public.mentorship_match_score(uuid, uuid) to authenticated;

revoke all on function public.expire_due_mentorships() from public;
grant execute on function public.expire_due_mentorships() to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime (messages, mentorship status, requests, sessions)
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.mentorship_messages;
alter publication supabase_realtime add table public.mentorships;
alter publication supabase_realtime add table public.mentorship_requests;
alter publication supabase_realtime add table public.mentorship_sessions;
