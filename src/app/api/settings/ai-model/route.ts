import { AI_MODEL_SETTING_KEY } from '@/lib/app-settings';
import { getCommitteeMemberOrResponse } from '@/lib/case-api-auth';
import { isSupportedAiModel } from '@/features/settings/ai-models';
import { NextResponse, type NextRequest } from 'next/server';
import * as z from 'zod';

const aiModelSchema = z.object({
  model: z.string().refine(isSupportedAiModel, 'Unsupported AI model.')
});

export async function PATCH(request: NextRequest) {
  const auth = await getCommitteeMemberOrResponse();

  if (auth.response) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = aiModelSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid AI model.' }, { status: 400 });
  }

  const { error } = await auth.supabase.from('app_settings').upsert({
    key: AI_MODEL_SETTING_KEY,
    value: parsed.data.model,
    description: 'Model used for case-management AI helpers.',
    updated_by_member_id: auth.member.id
  });

  if (error) {
    return NextResponse.json(
      { error: 'Unable to update AI model.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
