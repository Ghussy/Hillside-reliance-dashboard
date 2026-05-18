import { createClient } from '@/supabase/server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/auth/sign-in');
  }

  const { data: member } = await supabase
    .from('members')
    .select('role')
    .eq('auth_id', user.id)
    .single();

  if (member?.role === 'committee' || member?.role === 'admin') {
    redirect('/dashboard/cases');
  }

  redirect('/dashboard/members');
}
