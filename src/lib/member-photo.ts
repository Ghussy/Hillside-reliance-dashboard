export const MEMBER_PHOTOS_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_MEMBER_PHOTOS_BUCKET ?? 'member_pics';

export const SIGNED_URL_EXPIRY = 3600; // 1 hour

/**
 * True when `photo_url` is a relative storage path (not a full URL).
 */
export function isStoragePath(
  photoUrl: string | null | undefined
): photoUrl is string {
  if (!photoUrl?.trim()) return false;
  return !/^https?:\/\//i.test(photoUrl.trim());
}

// ---------------------------------------------------------------------------
// Signed-URL cache: avoids re-signing the same storage path within a process.
// The listing page signs 100 URLs at once; the detail page can reuse them
// instead of making another Storage API call.
// ---------------------------------------------------------------------------
const SIGNED_CACHE_TTL = 50 * 60 * 1000; // 50 min (signed URLs last 60 min)
const signedCache = new Map<string, { url: string; ts: number }>();

export function getCachedSignedUrl(path: string): string | undefined {
  const entry = signedCache.get(path);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > SIGNED_CACHE_TTL) {
    signedCache.delete(path);
    return undefined;
  }
  return entry.url;
}

export function setCachedSignedUrl(path: string, url: string): void {
  signedCache.set(path, { url, ts: Date.now() });
}
