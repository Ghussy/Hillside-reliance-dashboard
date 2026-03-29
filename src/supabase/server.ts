import { getSupabaseEnv } from '@/lib/env';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Fresh client per call — do not wrap in React.cache(): `cookies()` is dynamic,
 * and caching can interact badly with auth refresh + RLS in the same request.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll called from a Server Component — safe to ignore
          // when proxy handles session refresh.
        }
      }
    }
  });
}
