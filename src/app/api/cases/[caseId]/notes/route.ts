import { getCommitteeMemberOrResponse } from '@/lib/case-api-auth';
import { NextResponse, type NextRequest } from 'next/server';
import * as z from 'zod';

const noteSchema = z.object({
  body: z.string().trim().min(1),
  noteType: z
    .enum(['general', 'contact', 'ai_summary', 'follow_up'])
    .default('general'),
  aiGenerated: z.boolean().default(false)
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
  const parsed = noteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid note.' }, { status: 400 });
  }

  const { error } = await auth.supabase.from('case_notes').insert({
    case_id: caseId,
    author_member_id: auth.member.id,
    body: parsed.data.body,
    note_type: parsed.data.noteType,
    ai_generated: parsed.data.aiGenerated
  });

  if (error) {
    return NextResponse.json({ error: 'Unable to add note.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
