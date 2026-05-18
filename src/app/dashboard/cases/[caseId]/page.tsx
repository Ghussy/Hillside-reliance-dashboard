import PageContainer from '@/components/layout/page-container';
import { CaseDetailClient } from '@/features/cases/components/case-detail-client';
import {
  CASE_DETAIL_SELECT,
  coerceAssignees,
  coerceCaseRecord
} from '@/features/cases/data';
import { requireCommitteeMember } from '@/lib/case-auth';
import { createClient } from '@/supabase/server';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard: Case Detail'
};

type PageProps = {
  params: Promise<{ caseId: string }>;
};

export default async function CaseDetailPage(props: PageProps) {
  await requireCommitteeMember();

  const { caseId } = await props.params;
  const supabase = await createClient();
  const [{ data: caseData }, { data: membersData }] = await Promise.all([
    supabase.from('cases').select(CASE_DETAIL_SELECT).eq('id', caseId).single(),
    supabase
      .from('members')
      .select('id, name, email, phone, role')
      .eq('status', 'active')
      .in('role', ['committee', 'admin'])
      .order('name')
  ]);

  if (!caseData) {
    notFound();
  }

  return (
    <PageContainer
      pageTitle='Case Detail'
      pageDescription='Manage ownership, notes, first contact, and follow-up.'
    >
      <CaseDetailClient
        caseRecord={coerceCaseRecord(caseData)}
        members={coerceAssignees(membersData)}
      />
    </PageContainer>
  );
}
