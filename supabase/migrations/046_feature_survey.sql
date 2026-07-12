-- Voila: one-time in-app feature survey
-- Adds a completion flag to profiles and a table to store the four survey answers.

alter table public.profiles
  add column if not exists feature_survey_completed boolean not null default false;

create table if not exists public.feature_survey_responses (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles (id) on delete cascade,
  experience_rating  smallint not null check (experience_rating between 1 and 5),
  most_used_feature  text not null,
  likes_mobile_app   boolean not null,
  feature_request    text not null,
  created_at         timestamptz not null default now()
);

alter table public.feature_survey_responses enable row level security;

drop policy if exists "Users can insert own survey response" on public.feature_survey_responses;
create policy "Users can insert own survey response"
  on public.feature_survey_responses for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can read own survey response" on public.feature_survey_responses;
create policy "Users can read own survey response"
  on public.feature_survey_responses for select
  to authenticated
  using (user_id = auth.uid());
