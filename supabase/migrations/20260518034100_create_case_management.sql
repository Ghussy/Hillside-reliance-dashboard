create or replace function public.current_member_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.members
  where auth_id = auth.uid()
    and status = 'active'
  limit 1
$$;

create or replace function public.is_committee_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_member_role() in ('committee', 'admin'), false)
$$;

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  intake_submission_id uuid not null unique references public.intake_submissions(id) on delete cascade,
  status text not null default 'new',
  priority text not null default 'medium',
  category text,
  assigned_to_member_id uuid references public.members(id) on delete set null,
  next_step text,
  follow_up_at timestamp with time zone,
  last_contact_at timestamp with time zone,
  closed_at timestamp with time zone,
  ai_triage jsonb not null default '{}'::jsonb,
  ai_first_contact_draft text,
  ai_follow_up_suggestion text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint cases_status_check check (
    status in (
      'new',
      'assigned',
      'initial_contact_made',
      'active_support',
      'waiting_on_member',
      'resolved',
      'inactive'
    )
  ),
  constraint cases_priority_check check (
    priority in ('low', 'medium', 'high', 'urgent')
  )
);

create table if not exists public.case_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  author_member_id uuid references public.members(id) on delete set null,
  body text not null,
  note_type text not null default 'general',
  ai_generated boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint case_notes_note_type_check check (
    note_type in ('general', 'contact', 'ai_summary', 'follow_up')
  )
);

create table if not exists public.case_reminders (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  assigned_to_member_id uuid references public.members(id) on delete set null,
  title text not null,
  due_at timestamp with time zone not null,
  status text not null default 'open',
  completed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  constraint case_reminders_status_check check (
    status in ('open', 'done', 'snoozed')
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_cases_updated_at on public.cases;
create trigger set_cases_updated_at
before update on public.cases
for each row
execute function public.set_updated_at();

alter table public.intake_submissions enable row level security;
alter table public.cases enable row level security;
alter table public.case_notes enable row level security;
alter table public.case_reminders enable row level security;

drop policy if exists "committee can read intake submissions" on public.intake_submissions;
create policy "committee can read intake submissions"
on public.intake_submissions
for select
to authenticated
using (public.is_committee_or_admin());

drop policy if exists "committee can update intake submissions" on public.intake_submissions;
create policy "committee can update intake submissions"
on public.intake_submissions
for update
to authenticated
using (public.is_committee_or_admin())
with check (public.is_committee_or_admin());

drop policy if exists "committee can read cases" on public.cases;
create policy "committee can read cases"
on public.cases
for select
to authenticated
using (public.is_committee_or_admin());

drop policy if exists "committee can insert cases" on public.cases;
create policy "committee can insert cases"
on public.cases
for insert
to authenticated
with check (public.is_committee_or_admin());

drop policy if exists "committee can update cases" on public.cases;
create policy "committee can update cases"
on public.cases
for update
to authenticated
using (public.is_committee_or_admin())
with check (public.is_committee_or_admin());

drop policy if exists "committee can read case notes" on public.case_notes;
create policy "committee can read case notes"
on public.case_notes
for select
to authenticated
using (public.is_committee_or_admin());

drop policy if exists "committee can insert case notes" on public.case_notes;
create policy "committee can insert case notes"
on public.case_notes
for insert
to authenticated
with check (public.is_committee_or_admin());

drop policy if exists "committee can read case reminders" on public.case_reminders;
create policy "committee can read case reminders"
on public.case_reminders
for select
to authenticated
using (public.is_committee_or_admin());

drop policy if exists "committee can insert case reminders" on public.case_reminders;
create policy "committee can insert case reminders"
on public.case_reminders
for insert
to authenticated
with check (public.is_committee_or_admin());

drop policy if exists "committee can update case reminders" on public.case_reminders;
create policy "committee can update case reminders"
on public.case_reminders
for update
to authenticated
using (public.is_committee_or_admin())
with check (public.is_committee_or_admin());

create index if not exists cases_status_created_at_idx
  on public.cases (status, created_at desc);

create index if not exists cases_assigned_to_member_id_idx
  on public.cases (assigned_to_member_id);

create index if not exists cases_follow_up_at_idx
  on public.cases (follow_up_at)
  where follow_up_at is not null and status not in ('resolved', 'inactive');

create index if not exists case_notes_case_id_created_at_idx
  on public.case_notes (case_id, created_at desc);

create index if not exists case_reminders_due_idx
  on public.case_reminders (status, due_at);
