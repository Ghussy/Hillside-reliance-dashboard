'use client';

import { useState, useMemo } from 'react';
import { Activity } from 'lucide-react';
import AnimatedTabs from '@/components/smoothui/animated-tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import { MemberDetailClient } from '@/features/members/components/member-detail-client';
import { cn } from '@/lib/utils';
import type { Calling, Member } from '@/types';

function compactTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
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

type FilterKey = 'all' | 'hasCalling' | 'committee';

type MemberSplitViewProps = {
  members: Member[];
};

export function MemberSplitView({ members }: MemberSplitViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    members[0]?.id ?? null
  );
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = useMemo(() => {
    let result = members;

    if (filter === 'hasCalling') {
      result = result.filter((m) => (m.callings ?? []).length > 0);
    } else if (filter === 'committee') {
      result = result.filter(
        (m) => m.role === 'committee' || m.role === 'admin'
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.phone?.includes(q)
      );
    }

    return result;
  }, [members, search, filter]);

  const selected = useMemo(
    () => members.find((m) => m.id === selectedId) ?? null,
    [members, selectedId]
  );

  const syncLabel = selected?.synced_at
    ? `Synced ${compactTimeAgo(new Date(selected.synced_at))}`
    : 'Never synced';

  return (
    <div className='flex min-h-0 flex-1 gap-2 p-2'>
      {/* ── Left: member list ── */}
      <div className='flex w-72 shrink-0 flex-col rounded-xl border'>
        <div className='flex flex-col gap-3 p-3'>
          <div className='flex items-baseline justify-between'>
            <span className='text-foreground text-sm font-medium'>Members</span>
            <span className='text-muted-foreground text-xs tabular-nums'>
              {filtered.length}
              {filtered.length !== members.length && ` / ${members.length}`}
            </span>
          </div>
          <Input
            placeholder='Search members...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-8'
          />
          <AnimatedTabs
            variant='segment'
            activeTab={filter}
            onChange={(v) => setFilter(v as FilterKey)}
            tabs={[
              { id: 'all', label: 'All' },
              { id: 'hasCalling', label: 'Callings' },
              { id: 'committee', label: 'Committee' }
            ]}
            className='w-full'
          />
        </div>

        <Separator />

        <div
          className='flex-1 overflow-y-auto'
          style={{ scrollbarWidth: 'none' }}
        >
          {filtered.map((m) => {
            const callings = (m.callings ?? []) as Calling[];
            const firstCalling = callings[0]?.name;
            return (
              <button
                key={m.id}
                type='button'
                onClick={() => setSelectedId(m.id)}
                className={cn(
                  'flex w-full items-center gap-3 border-b px-3 py-2.5 text-left transition-colors',
                  'hover:bg-accent',
                  selectedId === m.id && 'bg-accent'
                )}
              >
                <MemberAvatar member={m} className='size-10 shrink-0' />
                <div className='flex min-w-0 flex-1 flex-col'>
                  <span className='truncate text-sm font-medium'>{m.name}</span>
                  <span className='text-muted-foreground truncate text-xs'>
                    {firstCalling || '–'}
                  </span>
                  <span className='text-muted-foreground truncate text-xs'>
                    {m.phone || '–'}
                  </span>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className='text-muted-foreground p-6 text-center text-sm'>
              No members found
            </div>
          )}
        </div>
      </div>

      {/* ── Center: member detail ── */}
      <div className='flex flex-1 overflow-hidden rounded-xl border'>
        {selected ? (
          <div
            className='flex-1 overflow-y-auto'
            style={{ scrollbarWidth: 'none' }}
          >
            <MemberDetailClient
              key={selected.id}
              member={
                selected as Member & {
                  auth_id: string | null;
                  created_at: string | null;
                }
              }
              syncLabel={syncLabel}
            />
          </div>
        ) : (
          <div className='text-muted-foreground flex flex-1 items-center justify-center text-sm'>
            Select a member to view details
          </div>
        )}
      </div>

      {/* ── Right: recent activity ── */}
      <div className='flex flex-1 flex-col rounded-xl border'>
        <div className='flex items-center gap-2 p-3'>
          <Activity className='text-muted-foreground size-4' />
          <span className='text-sm font-medium'>Recent Activity</span>
        </div>
        <Separator />
        <div className='text-muted-foreground flex flex-1 items-center justify-center p-6 text-center text-sm'>
          No activity yet
        </div>
      </div>
    </div>
  );
}
