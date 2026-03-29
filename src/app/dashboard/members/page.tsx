import { Skeleton } from '@/components/ui/skeleton';
import MemberListingPage from '@/features/members/components/member-listing';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard: Members'
};

function SplitSkeleton() {
  return (
    <div className='flex min-h-0 flex-1'>
      <div className='flex w-96 shrink-0 flex-col gap-1 border-r p-4'>
        <Skeleton className='mb-3 h-5 w-24' />
        <Skeleton className='mb-2 h-8 w-full' />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className='h-16 w-full' />
        ))}
      </div>
      <div className='flex flex-1 p-2'>
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
