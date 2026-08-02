-- Dedup guard for the one-off "finish your profile" nudge sent to accounts
-- stuck mid-onboarding (see supabase/functions/send-onboarding-nudge).
-- Same claim-column pattern as welcome_email_sent_at (021) and
-- resend_contact_synced_at (068): update-where-null before sending so the
-- script can be re-run safely without double-emailing anyone.
alter table public.profiles
  add column if not exists onboarding_nudge_sent_at timestamptz;
