-- Allow active mentorship participants to read each other's profiles
-- (required for coach/mentee names, avatars, and matching details in the app).

create policy "Mentorship participants read peer profiles"
  on public.profiles for select
  to authenticated
  using (
    auth.uid() = id
    or exists (
      select 1
      from public.mentorships m
      where m.status = 'active'
        and (
          (m.mentor_id = auth.uid() and m.student_id = profiles.id)
          or (m.student_id = auth.uid() and m.mentor_id = profiles.id)
        )
    )
  );
