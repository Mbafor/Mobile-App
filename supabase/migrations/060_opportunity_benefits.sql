-- Adds an optional "Benefits" field to opportunities, shown alongside the
-- existing description ("About this opportunity") on the detail screen.
alter table public.opportunities add column if not exists benefits text;
