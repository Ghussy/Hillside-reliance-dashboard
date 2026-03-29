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

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchMember = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      setMember(null);
      return;
    }

    const supabase = createClient();
    const { data } = await supabase
      .from('members')
      .select(MEMBER_COLUMNS)
      .eq('auth_id', authUser.id)
      .single();

    if (data) {
      const pathToSign = data.photo_url || authUser.user_metadata?.avatar_url;
      if (isStoragePath(pathToSign)) {
        const { data: signed } = await supabase.storage
          .from(MEMBER_PHOTOS_BUCKET)
          .createSignedUrl(pathToSign, SIGNED_URL_EXPIRY);
        if (signed?.signedUrl) {
          data.photo_url = signed.signedUrl;
        }
      }
    }

    setMember((data as Member) ?? null);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      await fetchMember(authUser);
      setIsLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, [fetchMember]);

  return { user, member, isLoaded };
}

export function useSignOut() {
  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/sign-in';
  };

  return { signOut };
}
