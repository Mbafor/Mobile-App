-- Require email on profiles; backfill from auth.users before NOT NULL constraint.

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and u.email is not null
  and (p.email is null or trim(p.email) = '');

-- Keep profile email in sync when auth email changes
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, onboarding_complete)
  values (new.id, new.email, false)
  on conflict (id) do update
  set email = coalesce(excluded.email, public.profiles.email);

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Remove rows that cannot be backfilled (should not exist for real users)
delete from public.profiles
where email is null or trim(email) = '';

alter table public.profiles
  alter column email set not null;
