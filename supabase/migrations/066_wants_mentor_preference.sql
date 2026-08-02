-- Adds the "Do you wish to have a mentor?" onboarding question (step 3,
-- opportunity-preferences). Nullable, no default: existing users who already
-- completed onboarding before this question existed simply have NULL (never
-- asked), same convention as funding_preference.
alter table public.user_preferences add column if not exists wants_mentor boolean;
