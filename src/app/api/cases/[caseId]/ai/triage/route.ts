import { triageCase } from '@/features/cases/ai/case-ai';
import { CASE_DETAIL_SELECT, coerceCaseRecord } from '@/features/cases/data';
import { getCommitteeMemberOrResponse } from '@/lib/case-api-auth';
import { NextResponse } from 'next/server';

type PageProps = {
  params: Promise<{ caseId: string }>;
};

export async function POST(_request: Request, props: PageProps) {
  const auth = await getCommitteeMemberOrResponse();

  if (auth.response) {
    return auth.response;
  }

  const { caseId } = await props.params;
  const { data } = await auth.supabase
    .from('cases')
    .select(CASE_DETAIL_SELECT)
    .eq('id', caseId)
    .single();

  if (!data) {
    return NextResponse.json({ error: 'Case not found.' }, { status: 404 });
  }

  try {
    const triage = await triageCase(coerceCaseRecord(data));
    const { error } = await auth.supabase
      .from('cases')
      .update({
        ai_triage: triage,
        category: triage.category,
        priority: triage.priority,
        next_step: triage.suggestedNextStep
      })
      .eq('id', caseId);

    if (error) {
      return NextResponse.json(
        { error: 'Unable to save AI triage.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ triage });
  } catch {
    return NextResponse.json(
      { error: 'Unable to generate AI triage.' },
      { status: 500 }
    );
  }
}
