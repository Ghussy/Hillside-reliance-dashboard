import { suggestFollowUp } from '@/features/cases/ai/case-ai';
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
    const suggestion = await suggestFollowUp(coerceCaseRecord(data));
    const { error } = await auth.supabase
      .from('cases')
      .update({ ai_follow_up_suggestion: suggestion.suggestedNextStep })
      .eq('id', caseId);

    if (error) {
      return NextResponse.json(
        { error: 'Unable to save follow-up suggestion.' },
        { status: 500 }
      );
    }

    return NextResponse.json(suggestion);
  } catch {
    return NextResponse.json(
      { error: 'Unable to generate follow-up suggestion.' },
      { status: 500 }
    );
  }
}
