import type { CaseAssignee, CaseRecord } from './types';

export const CASE_DETAIL_SELECT = `
  id,
  intake_submission_id,
  status,
  priority,
  category,
  assigned_to_member_id,
  next_step,
  follow_up_at,
  last_contact_at,
  closed_at,
  ai_triage,
  ai_first_contact_draft,
  ai_follow_up_suggestion,
  created_at,
  updated_at,
  intake:intake_submissions (
    id,
    created_at,
    full_name,
    phone,
    email,
    preferred_contact_method,
    best_contact_times,
    assistance_types,
    assistance_other,
    situation_description,
    urgency_level,
    requested_amount,
    bill_due_dates,
    urgent_deadlines,
    safety_concerns,
    follow_up_plans
  ),
  assignee:members (
    id,
    name,
    email,
    phone,
    role
  ),
  notes:case_notes (
    id,
    case_id,
    author_member_id,
    body,
    note_type,
    ai_generated,
    created_at,
    author:members (
      id,
      name
    )
  ),
  reminders:case_reminders (
    id,
    case_id,
    assigned_to_member_id,
    title,
    due_at,
    status,
    completed_at,
    created_at
  )
` as const;

export const CASE_LIST_SELECT = `
  id,
  intake_submission_id,
  status,
  priority,
  category,
  assigned_to_member_id,
  next_step,
  follow_up_at,
  last_contact_at,
  closed_at,
  ai_triage,
  ai_first_contact_draft,
  ai_follow_up_suggestion,
  created_at,
  updated_at,
  intake:intake_submissions (
    id,
    created_at,
    full_name,
    phone,
    email,
    preferred_contact_method,
    best_contact_times,
    assistance_types,
    assistance_other,
    situation_description,
    urgency_level,
    requested_amount,
    bill_due_dates,
    urgent_deadlines,
    safety_concerns,
    follow_up_plans
  ),
  assignee:members (
    id,
    name,
    email,
    phone,
    role
  )
` as const;

export function coerceCaseRecord(value: unknown): CaseRecord {
  return value as CaseRecord;
}

export function coerceCaseRecords(value: unknown): CaseRecord[] {
  return (value ?? []) as CaseRecord[];
}

export function coerceAssignees(value: unknown): CaseAssignee[] {
  return (value ?? []) as CaseAssignee[];
}
