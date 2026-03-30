import { hasSupabaseEnv } from '@/lib/env';
import { createClient } from '@/supabase/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Server-side sign-out so auth cookies are cleared via the same path as
 * session refresh (createServerClient + applyServerStorage on SIGNED_OUT).
 * Client-only signOut() with document.cookie can miss server-set cookie flags.
 */
export async function GET(request: NextRequest) {
  if (hasSupabaseEnv) {
    const supabase = await createClient();
    await supabase.auth.getUser();
    await supabase.auth.signOut();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/auth/sign-in';
  url.search = '';
  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  return GET(request);
}
