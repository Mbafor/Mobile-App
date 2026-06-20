-- Allow NULL deadlines so the scraper can save opportunities that don't list one.
-- Admins set the actual deadline during the pending review flow.
alter table public.opportunities alter column deadline drop not null;
