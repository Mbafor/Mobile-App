-- Voila: self-service account deletion
-- Deletes the caller's auth.users row; all app data (profiles, preferences,
-- mentorship rows, notifications, saved opportunities, etc.) cascades via
-- existing "on delete cascade" foreign keys to auth.users.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
