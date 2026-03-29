'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { Member } from '@/types';
import { IconEdit, IconDotsVertical } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface CellActionProps {
  data: Member;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='size-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <IconDotsVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/members/${data.id}`)}
        >
          <IconEdit /> View details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
