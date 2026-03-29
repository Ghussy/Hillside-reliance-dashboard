import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Member } from '@/types';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  member?: Member | null;
  user?: {
    email?: string;
    phone?: string;
    user_metadata?: {
      avatar_url?: string;
      full_name?: string;
    };
  } | null;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  member,
  user
}: UserAvatarProfileProps) {
  const name = member?.name || user?.user_metadata?.full_name || '';
  const photo = member?.photo_url || user?.user_metadata?.avatar_url || '';
  const subtitle = member?.role || user?.email || user?.phone || '';
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
