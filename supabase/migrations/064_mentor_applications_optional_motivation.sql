-- The "Join Voila Initiative" general application form (web/app/mentor)
-- turned the motivation/"anything else" question optional (previously the
-- required "why do you want to be a mentor" essay). The column must allow
-- NULL too, or every submission that leaves it blank fails the insert.
alter table public.mentor_applications alter column motivation drop not null;
