/**
 * Supabase public env (required for auth).
 * Set in `.env.local` or `.env` — see `env.example.txt`.
 */
export const SUPABASE_ENV = {
  url: 'NEXT_PUBLIC_SUPABASE_URL',
  publishableKey: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
} as const;

export const hasSupabaseEnv: boolean =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export function getSupabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      `Supabase env missing. Set ${SUPABASE_ENV.url} and ${SUPABASE_ENV.publishableKey} in .env or .env.local (copy from env.example.txt).`
    );
  }

  return { url, key };
}
