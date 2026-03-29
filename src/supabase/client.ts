import { getSupabaseEnv } from '@/lib/env';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
