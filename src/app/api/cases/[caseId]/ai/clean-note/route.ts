import { cleanCaseNote } from '@/features/cases/ai/case-ai';
import { getCommitteeMemberOrResponse } from '@/lib/case-api-auth';
import { NextResponse } from 'next/server';
import * as z from 'zod';

const cleanNoteRequestSchema = z.object({
  notes: z.string().trim().min(1)
});

export async function POST(request: Request) {
  const auth = await getCommitteeMemberOrResponse();

  if (auth.response) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = cleanNoteRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid notes.' }, { status: 400 });
  }

  try {
    const note = await cleanCaseNote(parsed.data.notes);
    return NextResponse.json(note);
  } catch {
    return NextResponse.json(
      { error: 'Unable to clean case note.' },
      { status: 500 }
    );
  }
}
