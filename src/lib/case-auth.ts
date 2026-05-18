import { createClient } from '@/supabase/server';
import type { Member } from '@/types';
import { redirect } from 'next/navigation';

const COMMITTEE_ROLES = new Set(['committee', 'admin']);

export function canManageCases(member: Pick<Member, 'role'> | null): boolean {
  return Boolean(member?.role && COMMITTEE_ROLES.has(member.role));
}

export async function requireCommitteeMember(): Promise<Member> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const { data: member } = await supabase
    .from('members')
    .select(
      'id, auth_id, name, email, phone, role, photo_url, household_name, address, status, callings, synced_at, created_at, updated_at, email_manual, phone_manual'
    )
    .eq('auth_id', user.id)
    .single();

  if (!canManageCases((member as Member | null) ?? null)) {
    redirect('/dashboard/overview');
  }

  return member as Member;
}
