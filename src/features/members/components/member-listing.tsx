import {
  MEMBER_PHOTOS_BUCKET,
  SIGNED_URL_EXPIRY,
  isStoragePath,
  setCachedSignedUrl
} from '@/lib/member-photo';
import { createClient } from '@/supabase/server';
import type { Member } from '@/types';
import { MemberSplitView } from './member-split-view';

const MEMBER_SELECT =
  'id, auth_id, name, email, phone, photo_url, household_name, address, status, role, callings, synced_at, created_at, email_manual, phone_manual' as const;

const CACHE_TTL = 5 * 60 * 1000;

type CacheEntry = { members: Member[]; ts: number };
let memberCache: CacheEntry | null = null;

function getCached(): Member[] | null {
  if (!memberCache) return null;
  if (Date.now() - memberCache.ts > CACHE_TTL) {
    memberCache = null;
    return null;
  }
  return memberCache.members;
}

function setCache(members: Member[]) {
  memberCache = { members, ts: Date.now() };
}

export default async function MemberListingPage() {
  const cached = getCached();

  if (cached) {
    return <MemberSplitView members={cached} />;
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from('members')
    .select(MEMBER_SELECT)
    .eq('status', 'active')
    .order('name', { ascending: true });

  const members = (data ?? []) as Member[];

  const pathsToSign = members.map((m) => m.photo_url).filter(isStoragePath);

  if (pathsToSign.length > 0) {
    const { data: signed } = await supabase.storage
      .from(MEMBER_PHOTOS_BUCKET)
      .createSignedUrls(pathsToSign, SIGNED_URL_EXPIRY);

    if (signed) {
      const urlMap = new Map<string, string>();
      for (const entry of signed) {
        if (entry.signedUrl) {
          urlMap.set(entry.path ?? '', entry.signedUrl);
          setCachedSignedUrl(entry.path ?? '', entry.signedUrl);
        }
      }
      for (const m of members) {
        const signedUrl = m.photo_url ? urlMap.get(m.photo_url) : undefined;
        if (signedUrl) m.photo_url = signedUrl;
      }
    }
  }

  setCache(members);

  return <MemberSplitView members={members} />;
}
