create table if not exists public.intake_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  status text not null default 'new',
  full_name text not null,
  phone text,
  email text,
  address text,
  preferred_contact_method text not null,
  best_contact_times text,
  household_info text,
  assistance_types text[] not null default '{}',
  assistance_other text,
  situation_description text not null,
  need_started text,
  need_duration text not null,
  help_tried text,
  current_support_available text,
  urgent_deadlines text,
  urgency_level text not null,
  urgency_flags text[] not null default '{}',
  safety_concerns text,
  income_employment_status text,
  major_expenses text,
  requested_amount text,
  bill_due_dates text,
  other_resources_contacted text,
  support_sources text[] not null default '{}',
  church_assistance_details text,
  professional_services text,
  follow_up_plans text,
  follow_up_contact_name text,
  follow_up_availability text,
  share_permission boolean not null default false,
  privacy_acknowledgement boolean not null default false,
  constraint intake_submissions_status_check check (
    status in ('new', 'reviewing', 'contacted', 'closed')
  ),
  constraint intake_submissions_contact_method_check check (
    preferred_contact_method in ('phone', 'text', 'email', 'visit', 'any')
  ),
  constraint intake_submissions_need_duration_check check (
    need_duration in ('temporary', 'ongoing', 'unsure')
  ),
  constraint intake_submissions_urgency_level_check check (
    urgency_level in ('immediate', 'this_week', 'soon', 'not_urgent')
  ),
  constraint intake_submissions_assistance_types_check check (
    assistance_types <@ array[
      'food_groceries',
      'housing_rent',
      'utilities_bills',
      'transportation',
      'employment',
      'medical_health',
      'emotional_spiritual',
      'childcare_family',
      'moving_repairs',
      'other'
    ]::text[]
  ),
  constraint intake_submissions_urgency_flags_check check (
    urgency_flags <@ array[
      'basic_needs',
      'medical_crisis',
      'housing_crisis',
      'financial_crisis',
      'family_crisis',
      'vulnerable_people',
      'leader_contact_needed'
    ]::text[]
  ),
  constraint intake_submissions_support_sources_check check (
    support_sources <@ array[
      'family_friends',
      'neighbors',
      'ministering',
      'church_assistance',
      'community_programs',
      'government_services',
      'professional_services',
      'none'
    ]::text[]
  )
);

alter table public.intake_submissions enable row level security;

create index if not exists intake_submissions_created_at_idx
  on public.intake_submissions (created_at desc);

create index if not exists intake_submissions_status_idx
  on public.intake_submissions (status);
