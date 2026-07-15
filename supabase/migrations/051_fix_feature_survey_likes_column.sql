-- 046_feature_survey.sql was edited in place after it had already been applied
-- remotely (excited_about text -> likes_mobile_app boolean), so the deployed
-- schema never picked up the rename. Apply it for real here.

alter table public.feature_survey_responses
  drop column if exists excited_about;

alter table public.feature_survey_responses
  add column if not exists likes_mobile_app boolean not null default false;

alter table public.feature_survey_responses
  alter column likes_mobile_app drop default;
