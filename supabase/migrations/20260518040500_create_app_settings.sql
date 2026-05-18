create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamp with time zone not null default now(),
  updated_by_member_id uuid references public.members(id) on delete set null
);

drop trigger if exists set_app_settings_updated_at on public.app_settings;
create trigger set_app_settings_updated_at
before update on public.app_settings
for each row
execute function public.set_updated_at();

alter table public.app_settings enable row level security;

drop policy if exists "committee can read app settings" on public.app_settings;
create policy "committee can read app settings"
on public.app_settings
for select
to authenticated
using (public.is_committee_or_admin());

drop policy if exists "committee can update app settings" on public.app_settings;
create policy "committee can update app settings"
on public.app_settings
for update
to authenticated
using (public.is_committee_or_admin())
with check (public.is_committee_or_admin());

drop policy if exists "committee can insert app settings" on public.app_settings;
create policy "committee can insert app settings"
on public.app_settings
for insert
to authenticated
with check (public.is_committee_or_admin());

insert into public.app_settings (key, value, description)
values (
  'ai_model',
  '"gpt-5.5"'::jsonb,
  'Model used for case-management AI helpers.'
)
on conflict (key) do nothing;
