-- Trending opportunities: rank active/approved opportunities by save count
-- without exposing which user saved what (security definer, aggregate-only).

create or replace function public.get_trending_opportunities(result_limit int default 10)
returns table (opportunity_id uuid, save_count int)
language sql
security definerd

set search_path = public
stable
as $$
  select s.opportunity_id, count(*)::int as save_count
  from public.saved_opportunities s
  join public.opportunities o on o.id = s.opportunity_id
  where o.status = 'approved'
    and o.is_active = true
    and (o.deadline is null or o.deadline > now())
  group by s.opportunity_id
  order by save_count desc, max(s.created_at) desc
  limit result_limit
$$;

revoke all on function public.get_trending_opportunities(int) from public;
grant execute on function public.get_trending_opportunities(int) to authenticated, anon;
