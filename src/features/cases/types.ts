export type CaseStatus =
  | 'new'
  | 'assigned'
  | 'initial_contact_made'
  | 'active_support'
  | 'waiting_on_member'
  | 'resolved'
  | 'inactive';

export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

export type CaseNote = {
  id: string;
  case_id: string;
  author_member_id: string | null;
  body: string;
  note_type: string;
  ai_generated: boolean;
  created_at: string;
  author?: {
    id: string;
    name: string;
  } | null;
};

export type CaseReminder = {
  id: string;
  case_id: string;
  assigned_to_member_id: string | null;
  title: string;
  due_at: string;
  status: string;
  completed_at: string | null;
  created_at: string;
};

export type IntakeSubmission = {
  id: string;
  created_at: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  preferred_contact_method: string;
  best_contact_times: string | null;
  assistance_types: string[];
  assistance_other: string | null;
  situation_description: string;
  urgency_level: string;
  requested_amount: string | null;
  bill_due_dates: string | null;
  urgent_deadlines: string | null;
  safety_concerns: string | null;
  follow_up_plans: string | null;
};

export type CaseAssignee = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
};

export type CaseRecord = {
  id: string;
  intake_submission_id: string;
  status: CaseStatus;
  priority: CasePriority;
  category: string | null;
  assigned_to_member_id: string | null;
  next_step: string | null;
  follow_up_at: string | null;
  last_contact_at: string | null;
  closed_at: string | null;
  ai_triage: Record<string, unknown>;
  ai_first_contact_draft: string | null;
  ai_follow_up_suggestion: string | null;
  created_at: string;
  updated_at: string;
  intake: IntakeSubmission | null;
  assignee: CaseAssignee | null;
  notes?: CaseNote[];
  reminders?: CaseReminder[];
};
