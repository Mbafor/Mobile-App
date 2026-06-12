-- Mentor applications for students who want to become mentors
-- Stores application data for review and approval.

create table if not exists public.mentor_applications (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  linkedin text,
  portfolio text,
  area_of_expertise text not null,
  years_of_experience text not null,
  short_bio text not null,
  motivation text not null,
  status text not null default 'pending',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists mentor_applications_updated_at on public.mentor_applications;
create trigger mentor_applications_updated_at
  before update on public.mentor_applications
  for each row execute function public.set_updated_at();

alter table public.mentor_applications enable row level security;

create policy "Anon can insert mentor applications"
  on public.mentor_applications for insert
  with check (true);

create policy "Admin can manage mentor applications"
  on public.mentor_applications for select, update, delete
  using (auth.role() = 'authenticated');
