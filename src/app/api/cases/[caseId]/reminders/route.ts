import { getCommitteeMemberOrResponse } from '@/lib/case-api-auth';
import { NextResponse, type NextRequest } from 'next/server';
import * as z from 'zod';

const reminderSchema = z.object({
  title: z.string().trim().min(1),
  dueAt: z.string().min(1),
  assignedToMemberId: z.string().uuid().nullable().optional()
});

type PageProps = {
  params: Promise<{ caseId: string }>;
};

export async function POST(request: NextRequest, props: PageProps) {
  const auth = await getCommitteeMemberOrResponse();

  if (auth.response) {
    return auth.response;
  }

  const { caseId } = await props.params;
  const body = await request.json().catch(() => null);
  const parsed = reminderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid reminder.' }, { status: 400 });
  }

  const { error } = await auth.supabase.from('case_reminders').insert({
    case_id: caseId,
    title: parsed.data.title,
    due_at: parsed.data.dueAt,
    assigned_to_member_id: parsed.data.assignedToMemberId ?? auth.member.id
  });

  if (error) {
    return NextResponse.json(
      { error: 'Unable to add reminder.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
