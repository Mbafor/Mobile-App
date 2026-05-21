-- Phase 6: searchable / filterable opportunity fields

alter table public.opportunities
  add column if not exists country text,
  add column if not exists category text,
  add column if not exists funding_type text,
  add column if not exists degree_levels text[] not null default '{}',
  add column if not exists location_type text;

create index if not exists opportunities_country_idx on public.opportunities (country);
create index if not exists opportunities_category_idx on public.opportunities (category);
create index if not exists opportunities_funding_type_idx on public.opportunities (funding_type);
create index if not exists opportunities_location_type_idx on public.opportunities (location_type);

-- Backfill seed rows (titles from 002 migration)
update public.opportunities set
  country = 'United Kingdom',
  category = 'Internship',
  funding_type = 'fully_funded',
  degree_levels = array['bachelors', 'masters'],
  location_type = 'hybrid'
where title = 'Summer Research Internship';

update public.opportunities set
  country = 'Global',
  category = 'Fellowship',
  funding_type = 'fully_funded',
  degree_levels = array['masters', 'professional'],
  location_type = 'remote'
where title = 'Global Leadership Fellowship';

update public.opportunities set
  country = 'United States',
  category = 'Scholarship',
  funding_type = 'fully_funded',
  degree_levels = array['bachelors'],
  location_type = 'onsite'
where title = 'Merit Scholarship Programme';

update public.opportunities set
  country = 'Germany',
  category = 'Grant & Funding',
  funding_type = 'partially_funded',
  degree_levels = array['bachelors', 'masters', 'phd'],
  location_type = 'hybrid'
where title = 'Green Innovation Grant';

update public.opportunities set
  country = 'United Kingdom',
  category = 'Graduate Programme',
  funding_type = 'fully_funded',
  degree_levels = array['bachelors', 'masters'],
  location_type = 'onsite'
where title = 'Data Analytics Graduate Programme';

update public.opportunities set
  country = 'Canada',
  category = 'Fellowship',
  funding_type = 'partially_funded',
  degree_levels = array['bachelors', 'masters'],
  location_type = 'onsite'
where title = 'Creative Arts Residency';

update public.opportunities set
  country = 'United Kingdom',
  category = 'Bootcamp & Training',
  funding_type = 'self_funded',
  degree_levels = array['masters', 'professional'],
  location_type = 'remote'
where title = 'Healthcare Innovation Bootcamp';

update public.opportunities set
  country = 'Global',
  category = 'Exchange Programme',
  funding_type = 'fully_funded',
  degree_levels = array['bachelors', 'masters'],
  location_type = 'hybrid'
where title = 'Policy & Governance Exchange';
