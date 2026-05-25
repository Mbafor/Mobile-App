-- Message attachments + storage for mentorship chat media

alter table public.mentorship_messages
  add column if not exists attachment_url text,
  add column if not exists attachment_type text
    check (attachment_type is null or attachment_type in ('image', 'file'));

alter table public.mentorship_messages
  drop constraint if exists mentorship_messages_body_check;

alter table public.mentorship_messages
  add constraint mentorship_messages_body_or_attachment_check
  check (
    char_length(trim(body)) > 0
    or attachment_url is not null
  );

insert into storage.buckets (id, name, public)
values ('mentorship-attachments', 'mentorship-attachments', true)
on conflict (id) do update set public = true;

create policy "Mentorship attachments are publicly readable"
  on storage.objects for select
  using (bucket_id = 'mentorship-attachments');

create policy "Participants upload mentorship attachments"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'mentorship-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Participants update own mentorship attachments"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'mentorship-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Participants delete own mentorship attachments"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'mentorship-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
