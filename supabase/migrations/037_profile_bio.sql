-- Add bio field to user profiles
alter table public.profiles add column if not exists bio text;
