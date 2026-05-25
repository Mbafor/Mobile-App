-- Opportunity tracker: pipeline stage + notes on saved_opportunities
-- Justification: saved_opportunities only tracked save date; applied_opportunities
-- is binary and cannot represent Interview / Offer / Closed. Notes did not exist.

alter table public.saved_opportunities
  add column if not exists stage text not null default 'saved'
    check (stage in ('saved', 'applied', 'interview', 'offer', 'closed')),
  add column if not exists notes text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists saved_opportunities_user_stage_idx
  on public.saved_opportunities (user_id, stage);

-- Backfill stage from applied_opportunities
update public.saved_opportunities so
set
  stage = 'applied',
  updated_at = greatest(so.updated_at, ao.applied_at)
from public.applied_opportunities ao
where ao.user_id = so.user_id
  and ao.opportunity_id = so.opportunity_id
  and so.stage = 'saved';

-- Users can update stage and notes on their saved rows
create policy "Users update own saved opportunities"
  on public.saved_opportunities for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
