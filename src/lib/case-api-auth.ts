import { canManageCases } from '@/lib/case-auth';
import { createClient } from '@/supabase/server';
import type { Member } from '@/types';
import { NextResponse } from 'next/server';

export async function getCommitteeMemberOrResponse(): Promise<
  | {
      supabase: Awaited<ReturnType<typeof createClient>>;
      member: Member;
      response?: never;
    }
  | {
      response: NextResponse;
      supabase?: never;
      member?: never;
    }
> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      response: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    };
  }

  const { data } = await supabase
    .from('members')
    .select(
      'id, auth_id, name, email, phone, role, photo_url, household_name, address, status, callings, synced_at, created_at, updated_at, email_manual, phone_manual'
    )
    .eq('auth_id', user.id)
    .single();

  const member = data as Member | null;

  if (!canManageCases(member)) {
    return {
      response: NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    };
  }

  return { supabase, member: member as Member };
}
