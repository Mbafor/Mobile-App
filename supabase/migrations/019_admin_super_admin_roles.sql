-- Admin vs Super Admin role separation:
-- - Opportunity admins: manage opportunities only
-- - Super admins: analytics + platform management + opportunities

-- ---------------------------------------------------------------------------
-- Track who posted each opportunity (for admin analytics)
-- ---------------------------------------------------------------------------
alter table public.opportunities
  add column if not exists created_by uuid references auth.users (id) on delete set null;

create index if not exists opportunities_created_by_idx
  on public.opportunities (created_by)
  where created_by is not null;

-- ---------------------------------------------------------------------------
-- Combined permission for opportunity CRUD (admin OR super admin)
-- ---------------------------------------------------------------------------
create or replace function public.current_user_can_manage_opportunities()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_is_admin() or public.current_user_is_super_admin();
$$;

revoke all on function public.current_user_can_manage_opportunities() from public;
grant execute on function public.current_user_can_manage_opportunities() to authenticated;

drop policy if exists "Admins can read all opportunities" on public.opportunities;
drop policy if exists "Admins can insert opportunities" on public.opportunities;
drop policy if exists "Admins can update opportunities" on public.opportunities;
drop policy if exists "Admins can delete opportunities" on public.opportunities;

create policy "Admins can read all opportunities"
  on public.opportunities for select
  to authenticated
  using (public.current_user_can_manage_opportunities());

create policy "Admins can insert opportunities"
  on public.opportunities for insert
  to authenticated
  with check (public.current_user_can_manage_opportunities());

create policy "Admins can update opportunities"
  on public.opportunities for update
  to authenticated
  using (public.current_user_can_manage_opportunities())
  with check (public.current_user_can_manage_opportunities());

create policy "Admins can delete opportunities"
  on public.opportunities for delete
  to authenticated
  using (public.current_user_can_manage_opportunities());

-- Analytics: super admins only (not opportunity admins)
create or replace function public.get_admin_analytics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.current_user_is_super_admin() then
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

-- Admin list: include opportunities posted count
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
        select count(*)::int
        from public.opportunities o
        where o.created_by = p.id
      ) as opportunities_posted
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

-- Create mentor profile for an existing user (by email)
create or replace function public.super_admin_create_mentor_by_email(p_email text)
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

  select id into v_user_id
  from public.profiles
  where lower(email) = lower(trim(p_email))
  limit 1;

  if v_user_id is null then
    raise exception 'user not found for email — they must sign up first' using errcode = 'P0015';
  end if;

  insert into public.mentor_profiles (user_id, status, reviewed_at, reviewed_by)
  values (v_user_id, 'approved', now(), auth.uid())
  on conflict (user_id) do update
  set
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    rejection_reason = null,
    updated_at = now();

  perform public.log_admin_action('mentor.create', 'mentor_profile', v_user_id, '{}'::jsonb);

  return jsonb_build_object('ok', true, 'user_id', v_user_id);
end;
$$;

grant execute on function public.super_admin_create_mentor_by_email(text) to authenticated;

-- Remove mentor profile (delete coach record)
create or replace function public.super_admin_delete_mentor(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_user_is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  delete from public.mentor_profiles where user_id = p_user_id;

  if not found then
    raise exception 'mentor not found' using errcode = 'P0002';
  end if;

  perform public.log_admin_action('mentor.delete', 'mentor_profile', p_user_id, '{}'::jsonb);

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.super_admin_delete_mentor(uuid) to authenticated;
