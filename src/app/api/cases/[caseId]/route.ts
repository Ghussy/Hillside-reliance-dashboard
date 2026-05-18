import { getCommitteeMemberOrResponse } from '@/lib/case-api-auth';
import { NextResponse, type NextRequest } from 'next/server';
import * as z from 'zod';

const updateCaseSchema = z.object({
  status: z
    .enum([
      'new',
      'assigned',
      'initial_contact_made',
      'active_support',
      'waiting_on_member',
      'resolved',
      'inactive'
    ])
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().trim().optional(),
  assignedToMemberId: z.string().uuid().nullable().optional(),
  nextStep: z.string().trim().optional(),
  followUpAt: z.string().nullable().optional(),
  lastContactAt: z.string().nullable().optional(),
  aiFirstContactDraft: z.string().trim().optional(),
  aiTriage: z.record(z.string(), z.unknown()).optional(),
  aiFollowUpSuggestion: z.string().trim().optional()
});

type PageProps = {
  params: Promise<{ caseId: string }>;
};

export async function PATCH(request: NextRequest, props: PageProps) {
  const auth = await getCommitteeMemberOrResponse();

  if (auth.response) {
    return auth.response;
  }

  const { caseId } = await props.params;
  const body = await request.json().catch(() => null);
  const parsed = updateCaseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid case update.' },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};

  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.priority !== undefined)
    updates.priority = parsed.data.priority;
  if (parsed.data.category !== undefined) {
    updates.category = parsed.data.category || null;
  }
  if (parsed.data.assignedToMemberId !== undefined) {
    updates.assigned_to_member_id = parsed.data.assignedToMemberId;
  }
  if (parsed.data.nextStep !== undefined) {
    updates.next_step = parsed.data.nextStep || null;
  }
  if (parsed.data.followUpAt !== undefined) {
    updates.follow_up_at = parsed.data.followUpAt;
  }
  if (parsed.data.lastContactAt !== undefined) {
    updates.last_contact_at = parsed.data.lastContactAt;
  }
  if (parsed.data.aiFirstContactDraft !== undefined) {
    updates.ai_first_contact_draft = parsed.data.aiFirstContactDraft || null;
  }
  if (parsed.data.aiTriage !== undefined) {
    updates.ai_triage = parsed.data.aiTriage;
  }
  if (parsed.data.aiFollowUpSuggestion !== undefined) {
    updates.ai_follow_up_suggestion = parsed.data.aiFollowUpSuggestion || null;
  }

  if (parsed.data.status === 'resolved' || parsed.data.status === 'inactive') {
    updates.closed_at = new Date().toISOString();
  }

  const { error } = await auth.supabase
    .from('cases')
    .update(updates)
    .eq('id', caseId);

  if (error) {
    return NextResponse.json(
      { error: 'Unable to update case.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
