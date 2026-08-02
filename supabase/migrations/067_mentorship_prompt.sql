-- One-time "join mentorship" nudge popup, shown once ever per user (new or
-- pre-existing) after they land on the dashboard. Same "seen" pattern as
-- feature_survey_completed (046_feature_survey.sql): a DB column, not
-- AsyncStorage, so it's correct across devices/reinstalls for both new and
-- already-existing accounts.
alter table public.profiles add column if not exists mentorship_prompt_seen boolean not null default false;
