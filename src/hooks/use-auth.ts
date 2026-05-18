'use client';

import {
  MEMBER_PHOTOS_BUCKET,
  SIGNED_URL_EXPIRY,
  isStoragePath
} from '@/lib/member-photo';
import { createClient } from '@/supabase/client';
import type { Member } from '@/types';
import type { User } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

const MEMBER_COLUMNS =
  'id, auth_id, name, email, phone, role, photo_url' as const;

async function signStoragePath(path: string): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.storage
    .from(MEMBER_PHOTOS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY);
  return data?.signedUrl ?? null;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchMember = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      setMember(null);
      setAvatarUrl(null);
      return;
    }

    const supabase = createClient();
    const { data } = await supabase
      .from('members')
      .select(MEMBER_COLUMNS)
      .eq('auth_id', authUser.id)
      .single();

    const bestPhotoPath =
      (data?.photo_url as string | undefined) ||
      authUser.user_metadata?.avatar_url ||
      null;

    if (data && isStoragePath(bestPhotoPath)) {
      const signed = await signStoragePath(bestPhotoPath);
      if (signed) data.photo_url = signed;
      setAvatarUrl(signed ?? bestPhotoPath);
    } else if (isStoragePath(bestPhotoPath)) {
      setAvatarUrl((await signStoragePath(bestPhotoPath)) ?? bestPhotoPath);
    } else {
      setAvatarUrl(bestPhotoPath);
    }

    setMember((data as Member) ?? null);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function loadInitialUser() {
      const {
        data: { user: authUser }
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      setUser(authUser);
      await fetchMember(authUser);

      if (isMounted) {
        setIsLoaded(true);
      }
    }

    void loadInitialUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      await fetchMember(authUser);
      setIsLoaded(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchMember]);

  return { user, member, avatarUrl, isLoaded };
}

export function useSignOut() {
  /** Full navigation: server route clears SSR cookies reliably (see auth/sign-out). */
  const signOut = (): void => {
    window.location.assign('/auth/sign-out');
  };

  return { signOut };
}
