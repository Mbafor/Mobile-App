-- Resolve who posted each event (partner org name, or admin/super-admin full
-- name) for a batch of event ids in one round trip, so event list/grid views
-- can show "Posted by ..." per card without an N+1 RPC call per event.
-- Mirrors get_opportunity_poster() (052_opportunity_poster.sql) but batched,
-- since events.owner_type/owner_id lives directly on the row (no join table).
create or replace function public.get_events_posters(p_event_ids uuid[])
returns table (event_id uuid, name text, kind text)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.id as event_id,
    coalesce(p.org_name, pr.full_name) as name,
    case
      when p.org_name is not null then 'partner'
      when pr.is_super_admin then 'superadmin'
      else 'admin'
    end as kind
  from public.events e
  left join public.partners p on e.owner_type = 'partner' and p.id = e.owner_id
  left join public.profiles pr on e.owner_type = 'admin' and pr.id = e.owner_id
  where e.id = any(p_event_ids)
    and (p.org_name is not null or (pr.full_name is not null and trim(pr.full_name) <> ''));
$$;

revoke all on function public.get_events_posters(uuid[]) from public;
grant execute on function public.get_events_posters(uuid[]) to anon, authenticated;
