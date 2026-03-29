'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import type { Calling, Member } from '@/types';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { Mail, Phone, Shield, Text, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { CellAction } from './cell-action';
import { ROLE_OPTIONS, STATUS_OPTIONS } from './options';

function compactTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export const columns: ColumnDef<Member>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Member, unknown> }) => (
      <DataTableColumnHeader column={column} title='Member' />
    ),
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className='flex max-w-[280px] min-w-0 items-center gap-3'>
          <MemberAvatar member={member} className='size-10' />
          <Link
            href={`/dashboard/members/${member.id}`}
            className='min-w-0 truncate font-medium underline-offset-4 hover:underline'
          >
            {member.name}
          </Link>
        </div>
      );
    },
    meta: {
      label: 'Name',
      placeholder: 'Search by name...',
      variant: 'text' as const,
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'callings',
    accessorKey: 'callings',
    header: 'Calling',
    cell: ({ row }) => {
      const callings = (row.original.callings ?? []) as Calling[];
      if (callings.length === 0) {
        return <span className='text-muted-foreground'>—</span>;
      }
      const first = callings[0];
      return (
        <div className='flex max-w-[200px] items-center gap-1.5'>
          <span className='truncate text-sm'>{first.name}</span>
          {callings.length > 1 && (
            <Badge variant='secondary' className='shrink-0'>
              +{callings.length - 1}
            </Badge>
          )}
        </div>
      );
    }
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: () => (
      <span className='inline-flex items-center gap-1.5'>
        <Phone className='text-muted-foreground' />
        Phone
      </span>
    ),
    cell: ({ row }) => {
      const phone = row.original.phone;
      if (!phone) return <span className='text-muted-foreground'>—</span>;
      const digits = phone.replace(/\D/g, '');
      return (
        <a
          href={`tel:${digits}`}
          className='text-sm tabular-nums underline-offset-4 hover:underline'
        >
          {phone}
        </a>
      );
    }
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: () => (
      <span className='inline-flex items-center gap-1.5'>
        <Mail className='text-muted-foreground' />
        Email
      </span>
    ),
    cell: ({ row }) => {
      const email = row.original.email;
      if (!email) return <span className='text-muted-foreground'>—</span>;
      return (
        <a
          href={`mailto:${email}`}
          className='max-w-[220px] truncate text-sm underline-offset-4 hover:underline'
        >
          {email}
        </a>
      );
    }
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: ({ column }: { column: Column<Member, unknown> }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ cell }) => {
      const role = cell.getValue<string>();
      return (
        <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
          <Shield />
          {role}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Role',
      variant: 'multiSelect' as const,
      options: ROLE_OPTIONS
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<Member, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<string>();
      return (
        <Badge variant={status === 'active' ? 'outline' : 'destructive'}>
          <UserCheck />
          {status}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'multiSelect' as const,
      options: STATUS_OPTIONS
    }
  },
  {
    accessorKey: 'synced_at',
    header: 'Synced',
    cell: ({ cell }) => {
      const val = cell.getValue<string>();
      if (!val) return <span className='text-muted-foreground'>—</span>;
      return (
        <span
          className='text-muted-foreground text-sm'
          title={new Date(val).toLocaleString()}
        >
          {compactTimeAgo(new Date(val))}
        </span>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
