-- Resolve who posted an opportunity (partner org name, or admin/super-admin
-- full name) without opening up broad reads on `partners`/`profiles`, which
-- are otherwise locked to self-read (see 048_partner_program.sql). Returns
-- null when there's nothing to attribute (e.g. scraped listings, which have
-- no partner_posts row and a null created_by).
create or replace function public.get_opportunity_poster(p_opportunity_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p.org_name is not null then jsonb_build_object('name', p.org_name, 'kind', 'partner')
    when pr.full_name is not null and trim(pr.full_name) <> '' then
      jsonb_build_object(
        'name', pr.full_name,
        'kind', case when pr.is_super_admin then 'superadmin' else 'admin' end
      )
    else null
  end
  from public.opportunities o
  left join public.partner_posts pp on pp.opportunity_id = o.id
  left join public.partners p on p.id = pp.partner_id
  left join public.profiles pr on pr.id = o.created_by
  where o.id = p_opportunity_id
  limit 1;
$$;

revoke all on function public.get_opportunity_poster(uuid) from public;
grant execute on function public.get_opportunity_poster(uuid) to authenticated;
