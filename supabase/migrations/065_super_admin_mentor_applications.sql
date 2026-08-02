-- Super admin review of "Join Voila Initiative" applications (mentor_applications,
-- 035_mentor_applications.sql). While wiring this up: that migration's select/
-- update/delete policies used `using (auth.role() = 'authenticated')` -- that
-- allows ANY logged-in user, not just admins, to read/modify/delete every
-- applicant's PII (name, email, phone, bio). Tightening to super-admin-only
-- here, matching the gate already used for opportunities/events
-- (current_user_can_manage_opportunities() / current_user_can_manage_events()).
-- The public anon-insert policy is untouched -- submissions must keep working.
drop policy if exists "Admin can select mentor applications" on public.mentor_applications;
drop policy if exists "Admin can update mentor applications" on public.mentor_applications;
drop policy if exists "Admin can delete mentor applications" on public.mentor_applications;

create policy "Super admins can read mentor applications"
  on public.mentor_applications for select
  to authenticated
  using (public.current_user_is_super_admin());

create policy "Super admins can update mentor applications"
  on public.mentor_applications for update
  to authenticated
  using (public.current_user_is_super_admin())
  with check (public.current_user_is_super_admin());

create policy "Super admins can delete mentor applications"
  on public.mentor_applications for delete
  to authenticated
  using (public.current_user_is_super_admin());
