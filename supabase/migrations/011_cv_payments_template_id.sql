-- Track which template was unlocked via template_unlock payments
alter table public.cv_payments
  add column if not exists template_id text;

create index if not exists cv_payments_user_template_idx
  on public.cv_payments (user_id, type, template_id)
  where type = 'template_unlock' and status = 'success';
