-- Super admin partner management: search/list, edit, activate/deactivate,
-- and lightweight analytics. partners (048_partner_program.sql) only has a
-- "read own row" RLS policy -- no admin-wide read/write path exists yet.
-- Mirrors the existing super_admin_* RPC pattern for mentors/admins
-- (015_super_admin_notifications.sql) instead of adding new RLS policies,
-- so the "self row only" policy on partners stays untouched; these
-- SECURITY DEFINER functions are the only way a super admin sees or
-- manages another partner's row. Manual partner creation (which also needs
-- to create a Supabase Auth user) stays in the Next.js server action layer,
-- same as provisionPartner (lib/partner-provisioning.ts) -- Postgres has no
-- access to the Auth Admin API, so there is no create RPC here.

create or replace function public.get_super_admin_partners(
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
  from public.partners p
  where (
    p_search is null
    or p.org_name ilike '%' || p_search || '%'
    or p.contact_email ilike '%' || p_search || '%'
    or p.slug ilike '%' || p_search || '%'
  );

  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v_items
  from (
    select
      p.id,
      p.org_name,
      p.slug,
      p.logo_url,
      p.contact_email,
      p.ref_code,
      p.is_active,
      p.created_at,
      (
        select count(*)::int
        from public.partner_posts pp
        where pp.partner_id = p.id
      ) as opportunities_posted
    from public.partners p
    where (
      p_search is null
      or p.org_name ilike '%' || p_search || '%'
      or p.contact_email ilike '%' || p_search || '%'
      or p.slug ilike '%' || p_search || '%'
    )
    order by p.created_at desc
    limit greatest(p_limit, 1)
    offset greatest(p_offset, 0)
  ) t;

  return jsonb_build_object('items', v_items, 'total', v_total);
end;
$$;

revoke all on function public.get_super_admin_partners(text, int, int) from public;
grant execute on function public.get_super_admin_partners(text, int, int) to authenticated;

create or replace function public.get_super_admin_partner(p_partner_id uuid)
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

  select row_to_json(t)::jsonb into result
  from (
    select id, org_name, slug, logo_url, contact_email, ref_code, is_active, created_at
    from public.partners
    where id = p_partner_id
  ) t;

  return result;
end;
$$;

revoke all on function public.get_super_admin_partner(uuid) from public;
grant execute on function public.get_super_admin_partner(uuid) to authenticated;

-- "Delete" is deactivate-only (per product decision) -- keeps partner_posts
-- and link_clicks history intact, same lifecycle model as mentor suspension.
create or replace function public.super_admin_set_partner_active(
  p_partner_id uuid,
  p_is_active boolean
)
returns void
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

  update public.partners set is_active = p_is_active where id = p_partner_id;

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    raise exception 'partner not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.super_admin_set_partner_active(uuid, boolean) from public;
grant execute on function public.super_admin_set_partner_active(uuid, boolean) to authenticated;

create or replace function public.super_admin_update_partner(
  p_partner_id    uuid,
  p_org_name      text,
  p_contact_email text,
  p_logo_url      text default null
)
returns void
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

  if coalesce(trim(p_org_name), '') = '' then
    raise exception 'Organization name is required' using errcode = '22023';
  end if;
  if coalesce(trim(p_contact_email), '') = '' then
    raise exception 'Contact email is required' using errcode = '22023';
  end if;

  update public.partners set
    org_name      = trim(p_org_name),
    contact_email = trim(p_contact_email),
    logo_url      = nullif(trim(coalesce(p_logo_url, '')), '')
  where id = p_partner_id;

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    raise exception 'partner not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.super_admin_update_partner(uuid, text, text, text) from public;
grant execute on function public.super_admin_update_partner(uuid, text, text, text) to authenticated;

create or replace function public.get_super_admin_partner_analytics()
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
    'total', (select count(*)::int from public.partners),
    'active', (select count(*)::int from public.partners where is_active = true),
    'total_opportunities_posted', (select count(*)::int from public.partner_posts),
    'total_link_clicks', (select count(*)::int from public.link_clicks),
    'by_partner', coalesce((
      select jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc)
      from (
        select p.org_name as label, count(pp.id)::int as value
        from public.partners p
        join public.partner_posts pp on pp.partner_id = p.id
        group by p.id, p.org_name
        order by value desc
        limit 10
      ) t
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_super_admin_partner_analytics() from public;
grant execute on function public.get_super_admin_partner_analytics() to authenticated;
