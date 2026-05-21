-- Admin: profiles.is_admin + opportunity management + dashboard stats

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

revoke all on function public.current_user_is_admin() from public;
grant execute on function public.current_user_is_admin() to authenticated;

-- Admins can read all opportunities (including expired); members still use active-only policy
create policy "Admins can read all opportunities"
  on public.opportunities for select
  to authenticated
  using (public.current_user_is_admin());

create policy "Admins can insert opportunities"
  on public.opportunities for insert
  to authenticated
  with check (public.current_user_is_admin());

create policy "Admins can update opportunities"
  on public.opportunities for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Admins can delete opportunities"
  on public.opportunities for delete
  to authenticated
  using (public.current_user_is_admin());

create or replace function public.get_admin_dashboard_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_user_is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return json_build_object(
    'opportunities_count', (select count(*)::int from public.opportunities),
    'users_count', (select count(*)::int from public.profiles),
    'saved_count', (select count(*)::int from public.saved_opportunities),
    'applied_count', (select count(*)::int from public.applied_opportunities)
  );
end;
$$;

revoke all on function public.get_admin_dashboard_stats() from public;
grant execute on function public.get_admin_dashboard_stats() to authenticated;
