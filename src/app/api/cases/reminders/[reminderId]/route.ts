import { getCommitteeMemberOrResponse } from '@/lib/case-api-auth';
import { NextResponse, type NextRequest } from 'next/server';
import * as z from 'zod';

const reminderUpdateSchema = z.object({
  status: z.enum(['open', 'done', 'snoozed'])
});

type PageProps = {
  params: Promise<{ reminderId: string }>;
};

export async function PATCH(request: NextRequest, props: PageProps) {
  const auth = await getCommitteeMemberOrResponse();

  if (auth.response) {
    return auth.response;
  }

  const { reminderId } = await props.params;
  const body = await request.json().catch(() => null);
  const parsed = reminderUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid reminder.' }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from('case_reminders')
    .update({
      status: parsed.data.status,
      completed_at:
        parsed.data.status === 'done' ? new Date().toISOString() : null
    })
    .eq('id', reminderId);

  if (error) {
    return NextResponse.json(
      { error: 'Unable to update reminder.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
