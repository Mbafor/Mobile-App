-- Let partners edit and delete opportunities they posted themselves.
-- Ownership is determined via partner_posts (the join table created in
-- 048_partner_program.sql), not a partner_id column on opportunities --
-- there isn't one, and partner-created rows are otherwise indistinguishable
-- from admin/scraper rows.

create or replace function public.current_partner_owns_opportunity(p_opportunity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.partner_posts
    where opportunity_id = p_opportunity_id
      and partner_id = public.current_partner_id()
  );
$$;

revoke all on function public.current_partner_owns_opportunity(uuid) from public;
grant execute on function public.current_partner_owns_opportunity(uuid) to authenticated;

create policy "Partners can update own opportunities"
  on public.opportunities for update
  to authenticated
  using (public.current_partner_owns_opportunity(id))
  with check (public.current_partner_owns_opportunity(id));

create policy "Partners can delete own opportunities"
  on public.opportunities for delete
  to authenticated
  using (public.current_partner_owns_opportunity(id));
