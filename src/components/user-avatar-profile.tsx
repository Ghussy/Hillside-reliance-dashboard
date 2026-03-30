import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Member } from '@/types';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  avatarUrl?: string | null;
  member?: Member | null;
  user?: {
    email?: string;
    phone?: string;
    user_metadata?: {
      avatar_url?: string;
      full_name?: string;
      name?: string;
    };
  } | null;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  avatarUrl,
  member,
  user
}: UserAvatarProfileProps) {
  const meta = user?.user_metadata;
  const name = member?.name || meta?.name || meta?.full_name || '';
  const photo = avatarUrl || member?.photo_url || '';
  const subtitle = member?.role || user?.email || '';
  const initials =
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  return (
    <div className='flex items-center gap-2'>
      <Avatar className={className}>
        <AvatarImage src={photo} alt={name} />
        <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{name || 'User'}</span>
          <span className='truncate text-xs'>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
