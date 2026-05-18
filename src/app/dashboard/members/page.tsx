import { Skeleton } from '@/components/ui/skeleton';
import MemberListingPage from '@/features/members/components/member-listing';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard: Members'
};

const skeletonRows = [
  'member-skeleton-one',
  'member-skeleton-two',
  'member-skeleton-three',
  'member-skeleton-four',
  'member-skeleton-five',
  'member-skeleton-six',
  'member-skeleton-seven',
  'member-skeleton-eight'
];

function SplitSkeleton() {
  return (
    <div className='flex min-h-0 flex-1'>
      <div className='flex w-full shrink-0 flex-col gap-1 border-r p-4 lg:w-96'>
        <Skeleton className='mb-3 h-5 w-24' />
        <Skeleton className='mb-2 h-11 w-full' />
        {skeletonRows.map((row) => (
          <Skeleton key={row} className='h-16 w-full' />
        ))}
      </div>
      <div className='hidden flex-1 p-2 lg:flex'>
        <Skeleton className='h-full w-full rounded-xl' />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className='flex h-0 grow flex-col'>
      <Suspense fallback={<SplitSkeleton />}>
        <MemberListingPage />
      </Suspense>
    </div>
  );
}
