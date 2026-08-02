-- Dedup guard for the Supabase -> Resend audience-contact sync webhook
-- (web/app/api/webhooks/resend-sync/route.ts). That webhook fires on every
-- qualifying `profiles` row change (not just the first one), so without a
-- claim column it re-adds the same contact to the Resend audience on every
-- onboarding step update -- and if that audience has a welcome automation
-- configured in Resend, each re-add can re-trigger it, producing duplicate
-- welcome emails.
alter table public.profiles
  add column if not exists resend_contact_synced_at timestamptz;
