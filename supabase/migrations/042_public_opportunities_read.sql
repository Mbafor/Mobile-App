-- Allow unauthenticated (anon) reads of approved, active opportunities.
-- Needed so the public landing page can show recently added opportunities
-- without requiring a login.
-- Mirrors the same filter as the authenticated policy (approved + active + not expired).

create policy "Anon can read approved active opportunities"
  on public.opportunities for select to anon
  using (
    (deadline is null or deadline > now())
    and status    = 'approved'
    and is_active = true
  );
