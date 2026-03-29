'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Member } from '@/types';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0];
    const last = parts[parts.length - 1];
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    }
  }
  return name.slice(0, 2).toUpperCase() || '?';
}

type MemberAvatarProps = {
  member: Pick<Member, 'name' | 'photo_url'>;
  className?: string;
};

export function MemberAvatar({ member, className }: MemberAvatarProps) {
  const src = member.photo_url || undefined;

  return (
    <Avatar className={cn('size-10 shrink-0', className)}>
      <AvatarImage src={src} alt='' />
      <AvatarFallback className='font-medium'>
        {getInitials(member.name)}
      </AvatarFallback>
    </Avatar>
  );
}
