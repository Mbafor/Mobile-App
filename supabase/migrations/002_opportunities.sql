-- Voila: opportunities (Phase 3 home feed)
-- Run after 001_profiles_and_preferences.sql

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  organization text not null,
  image_url text,
  deadline timestamptz not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists opportunities_deadline_idx on public.opportunities (deadline);
create index if not exists opportunities_created_at_idx on public.opportunities (created_at desc);

create or replace function public.set_opportunities_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists opportunities_updated_at on public.opportunities;
create trigger opportunities_updated_at
  before update on public.opportunities
  for each row execute function public.set_opportunities_updated_at();

alter table public.opportunities enable row level security;

-- Authenticated users can read active (non-expired) opportunities
create policy "Authenticated users can read active opportunities"
  on public.opportunities for select
  to authenticated
  using (deadline > now());

-- ---------------------------------------------------------------------------
-- Seed data (deadlines relative to now for testing)
-- ---------------------------------------------------------------------------
insert into public.opportunities (title, description, organization, image_url, deadline, tags)
values
  (
    'Summer Research Internship',
    'Join a 10-week research program in applied machine learning.',
    'TechBridge Labs',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    now() + interval '45 days',
    array['Internship', 'Technology & Innovation', 'Research & Academia']
  ),
  (
    'Global Leadership Fellowship',
    'Fully funded fellowship for emerging leaders in social impact.',
    'World Impact Foundation',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    now() + interval '12 days',
    array['Fellowship', 'Leadership & Management', 'Community & Social Impact']
  ),
  (
    'Merit Scholarship Programme',
    'Scholarships for outstanding undergraduate students.',
    'Horizon Education Trust',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
    now() + interval '28 days',
    array['Scholarship', 'Education']
  ),
  (
    'Green Innovation Grant',
    'Funding for sustainability-focused student projects.',
    'EcoFuture Initiative',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
    now() + interval '8 days',
    array['Grant & Funding', 'Sustainability & Environment']
  ),
  (
    'Data Analytics Graduate Programme',
    'Rotational graduate scheme across analytics teams.',
    'Nordic Analytics Group',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    now() + interval '60 days',
    array['Graduate Programme', 'Data & Analytics', 'Job (Full-time)']
  ),
  (
    'Creative Arts Residency',
    'Three-month residency for emerging artists and designers.',
    'Studio North Collective',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80',
    now() + interval '21 days',
    array['Fellowship', 'Creative Arts & Design']
  ),
  (
    'Healthcare Innovation Bootcamp',
    'Intensive training for digital health startups.',
    'MedVenture Hub',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    now() + interval '18 days',
    array['Bootcamp & Training', 'Healthcare & Wellness', 'Entrepreneurship']
  ),
  (
    'Policy & Governance Exchange',
    'Exchange programme for public policy students.',
    'Civic Leaders Network',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
    now() + interval '35 days',
    array['Exchange Programme', 'Policy & Governance']
  ),
  (
    'Expired Listing (hidden)',
    'This row should never appear in the app.',
    'Test Org',
    null,
    now() - interval '5 days',
    array['Internship']
  );
