import PageContainer from '@/components/layout/page-container';
import { CaseListing } from '@/features/cases/components/case-listing';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard: Cases'
};

export default function CasesPage() {
  return (
    <PageContainer
      pageTitle='Cases'
      pageDescription='Track intake requests, ownership, next steps, and follow-ups.'
    >
      <Suspense
        fallback={<div className='text-muted-foreground'>Loading cases...</div>}
      >
        <CaseListing />
      </Suspense>
    </PageContainer>
  );
}
