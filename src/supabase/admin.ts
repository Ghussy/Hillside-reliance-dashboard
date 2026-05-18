import { getSupabaseAdminEnv } from '@/lib/env';
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const { url, serviceRoleKey } = getSupabaseAdminEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
