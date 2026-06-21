-- Fix: two bugs in the approval pipeline
--
-- Bug 1: Student RLS policy uses `deadline > now()`, which evaluates
--   NULL > now() = NULL (falsy). Scraped items with no extracted deadline
--   are Quick-Approved but never appear in the student feed, making the
--   admin think the button did nothing.
--   Fix: treat NULL deadline as "no expiry" — the item stays visible until
--   manually deactivated or an admin sets a deadline via the review form.
--
-- Bug 2: approve_opportunity and reject_opportunity do UPDATE ... WHERE id = ?
--   with no row-count check. A mis-matched UUID (stale ID, already processed)
--   silently updates 0 rows and returns success — misleading the client.
--   Fix: raise an exception if 0 rows are affected.

-- ---------------------------------------------------------------------------
-- 1. Fix student RLS: NULL deadline = evergreen/rolling opportunity
-- ---------------------------------------------------------------------------
drop policy if exists "Students can read approved active opportunities" on public.opportunities;

create policy "Students can read approved active opportunities"
  on public.opportunities for select to authenticated
  using (
    (deadline is null or deadline > now())
    and status    = 'approved'
    and is_active = true
  );

-- ---------------------------------------------------------------------------
-- 2. Fix approve_opportunity: add 0-row guard
-- ---------------------------------------------------------------------------
drop function if exists public.approve_opportunity(uuid, text);

create or replace function public.approve_opportunity(
  p_opportunity_id uuid,
  p_notes          text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows int;
begin
  if not public.current_user_can_manage_opportunities() then
    raise exception 'permission denied' using errcode = '42501';
  end if;

  update public.opportunities set
    status      = 'approved',
    is_active   = true,
    reviewed_at = now(),
    reviewed_by = auth.uid()::text,
    admin_notes = coalesce(nullif(trim(p_notes), ''), admin_notes)
  where id = p_opportunity_id;

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    raise exception 'opportunity not found or already processed'
      using errcode = 'P0002';
  end if;
end;
$$;

grant execute on function public.approve_opportunity(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Fix reject_opportunity: add 0-row guard
-- ---------------------------------------------------------------------------
drop function if exists public.reject_opportunity(uuid, text);

create or replace function public.reject_opportunity(
  p_opportunity_id uuid,
  p_notes          text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows int;
begin
  if not public.current_user_can_manage_opportunities() then
    raise exception 'permission denied' using errcode = '42501';
  end if;

  update public.opportunities set
    status      = 'rejected',
    is_active   = false,
    reviewed_at = now(),
    reviewed_by = auth.uid()::text,
    admin_notes = coalesce(nullif(trim(p_notes), ''), admin_notes)
  where id = p_opportunity_id;

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    raise exception 'opportunity not found or already processed'
      using errcode = 'P0002';
  end if;
end;
$$;

grant execute on function public.reject_opportunity(uuid, text) to authenticated;
