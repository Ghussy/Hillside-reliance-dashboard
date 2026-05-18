alter table public.intake_submissions
  drop constraint if exists intake_submissions_assistance_types_check;

alter table public.intake_submissions
  add constraint intake_submissions_assistance_types_check check (
    assistance_types <@ array[
      'employment',
      'resume',
      'interview_prep',
      'career_direction',
      'budgeting',
      'debt',
      'housing',
      'mental_health',
      'social_connection',
      'other'
    ]::text[]
  );
