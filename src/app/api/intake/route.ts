import { intakeSchema, type IntakeSubmission } from '@/features/intake/schema';
import { appendIntakeToGoogleSheet } from '@/features/intake/google-sheets';
import { hasGoogleSheetsEnv } from '@/lib/env';
import { createAdminClient } from '@/supabase/admin';
import { NextResponse } from 'next/server';
import * as z from 'zod';

type IntakeSubmissionRow = {
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  preferred_contact_method: string;
  best_contact_times: string | null;
  household_info: string | null;
  assistance_types: string[];
  assistance_other: string | null;
  situation_description: string;
  need_started: string | null;
  need_duration: string;
  help_tried: string | null;
  current_support_available: string | null;
  urgent_deadlines: string | null;
  urgency_level: string;
  urgency_flags: string[];
  safety_concerns: string | null;
  income_employment_status: string | null;
  major_expenses: string | null;
  requested_amount: string | null;
  bill_due_dates: string | null;
  other_resources_contacted: string | null;
  support_sources: string[];
  church_assistance_details: string | null;
  professional_services: string | null;
  follow_up_plans: string | null;
  follow_up_contact_name: string | null;
  follow_up_availability: string | null;
  share_permission: boolean;
  privacy_acknowledgement: boolean;
};

type CaseInsertRow = {
  intake_submission_id: string;
  status: string;
  priority: string;
  category: string | null;
  next_step: string;
};

const SUPABASE_MIRROR_TIMEOUT_MS = 3000;

function cleanText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function deriveCaseCategory(values: IntakeSubmission): string | null {
  const [primaryType] = values.assistanceTypes;

  if (!primaryType) {
    return null;
  }

  if (
    ['employment', 'resume', 'interview_prep', 'career_direction'].includes(
      primaryType
    )
  ) {
    return 'employment';
  }

  if (['budgeting', 'debt'].includes(primaryType)) {
    return 'finances';
  }

  if (primaryType === 'housing') {
    return 'housing';
  }

  if (primaryType === 'mental_health') {
    return 'mental_health';
  }

  if (primaryType === 'social_connection') {
    return 'community';
  }

  return 'other';
}

function deriveCasePriority(values: IntakeSubmission): string {
  if (values.urgencyLevel === 'immediate') {
    return 'urgent';
  }

  if (values.urgencyLevel === 'this_week') {
    return 'high';
  }

  if (values.urgencyLevel === 'not_urgent') {
    return 'low';
  }

  return 'medium';
}

function toInitialCaseRow(
  intakeSubmissionId: string,
  values: IntakeSubmission
): CaseInsertRow {
  return {
    intake_submission_id: intakeSubmissionId,
    status: 'new',
    priority: deriveCasePriority(values),
    category: deriveCaseCategory(values),
    next_step: 'Review intake and make first contact.'
  };
}

function toIntakeSubmissionRow(values: IntakeSubmission): IntakeSubmissionRow {
  return {
    full_name: cleanText(values.fullName) ?? 'Anonymous',
    phone: cleanText(values.phone),
    email: cleanText(values.email),
    address: cleanText(values.address),
    preferred_contact_method: values.preferredContactMethod,
    best_contact_times: cleanText(values.bestContactTimes),
    household_info: cleanText(values.householdInfo),
    assistance_types: values.assistanceTypes,
    assistance_other: cleanText(values.assistanceOther),
    situation_description:
      cleanText(values.situationDescription) ??
      'No additional details provided.',
    need_started: cleanText(values.needStarted),
    need_duration: values.needDuration,
    help_tried: cleanText(values.helpTried),
    current_support_available: cleanText(values.currentSupportAvailable),
    urgent_deadlines: cleanText(values.urgentDeadlines),
    urgency_level: values.urgencyLevel,
    urgency_flags: values.urgencyFlags,
    safety_concerns: cleanText(values.safetyConcerns),
    income_employment_status: cleanText(values.incomeEmploymentStatus),
    major_expenses: cleanText(values.majorExpenses),
    requested_amount: cleanText(values.requestedAmount),
    bill_due_dates: cleanText(values.billDueDates),
    other_resources_contacted: cleanText(values.otherResourcesContacted),
    support_sources: values.supportSources,
    church_assistance_details: cleanText(values.churchAssistanceDetails),
    professional_services: cleanText(values.professionalServices),
    follow_up_plans: cleanText(values.followUpPlans),
    follow_up_contact_name: cleanText(values.followUpContactName),
    follow_up_availability: cleanText(values.followUpAvailability),
    share_permission: values.sharePermission,
    privacy_acknowledgement: values.privacyAcknowledgement
  };
}

async function persistToSupabase(values: IntakeSubmission): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('intake_submissions')
      .insert(toIntakeSubmissionRow(values))
      .select('id')
      .single();

    if (error || !data) {
      return false;
    }

    const { error: caseError } = await supabase
      .from('cases')
      .insert(toInitialCaseRow(data.id as string, values));

    return !caseError;
  } catch {
    return false;
  }
}

async function persistToSupabaseBestEffort(
  values: IntakeSubmission
): Promise<boolean> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<boolean>((resolve) => {
    timeoutId = setTimeout(() => resolve(false), SUPABASE_MIRROR_TIMEOUT_MS);
  });

  try {
    return await Promise.race([persistToSupabase(values), timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const parsed = intakeSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Please check the form and try again.',
        issues: z.flattenError(parsed.error).fieldErrors
      },
      { status: 400 }
    );
  }

  if (hasGoogleSheetsEnv) {
    try {
      await appendIntakeToGoogleSheet(parsed.data);
    } catch {
      return NextResponse.json(
        { error: 'Unable to submit the request right now.' },
        { status: 500 }
      );
    }
  }

  const savedToSupabase = await persistToSupabaseBestEffort(parsed.data);

  if (!savedToSupabase && !hasGoogleSheetsEnv) {
    return NextResponse.json(
      { error: 'Unable to submit the request right now.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { ok: true, savedToSheet: hasGoogleSheetsEnv, savedToSupabase },
    { status: 201 }
  );
}
