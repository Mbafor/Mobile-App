-- Admin analytics dashboard (security definer RPC)

create or replace function public.get_admin_analytics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.current_user_is_admin() then
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

revoke all on function public.get_admin_analytics() from public;
grant execute on function public.get_admin_analytics() to authenticated;
