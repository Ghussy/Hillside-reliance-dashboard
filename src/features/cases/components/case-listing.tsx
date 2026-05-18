import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CASE_LIST_SELECT, coerceCaseRecords } from '@/features/cases/data';
import { requireCommitteeMember } from '@/lib/case-auth';
import { createClient } from '@/supabase/server';
import type { CaseRecord } from '@/features/cases/types';
import {
  formatCaseDate,
  getPriorityLabel,
  getStatusLabel
} from '@/features/cases/utils';
import Link from 'next/link';

function getOpenCaseCount(cases: CaseRecord[]): number {
  return cases.filter(
    (caseRecord) => !['resolved', 'inactive'].includes(caseRecord.status)
  ).length;
}

function getOverdueCount(cases: CaseRecord[]): number {
  const now = Date.now();
  return cases.filter((caseRecord) => {
    if (
      !caseRecord.follow_up_at ||
      ['resolved', 'inactive'].includes(caseRecord.status)
    ) {
      return false;
    }

    return new Date(caseRecord.follow_up_at).getTime() < now;
  }).length;
}

function CaseCard({ caseRecord }: { caseRecord: CaseRecord }) {
  const intake = caseRecord.intake;

  return (
    <Link href={`/dashboard/cases/${caseRecord.id}`}>
      <Card className='hover:bg-muted/40 transition-colors'>
        <CardHeader className='gap-3'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <CardTitle className='text-base'>
                {intake?.full_name ?? 'Anonymous'}
              </CardTitle>
              <p className='text-muted-foreground mt-1 text-sm'>
                {caseRecord.category ?? 'uncategorized'} ·{' '}
                {formatCaseDate(caseRecord.created_at)}
              </p>
            </div>
            <Badge
              variant={
                caseRecord.priority === 'urgent' ? 'destructive' : 'secondary'
              }
            >
              {getPriorityLabel(caseRecord.priority)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          <div className='flex flex-wrap gap-2'>
            <Badge variant='outline'>{getStatusLabel(caseRecord.status)}</Badge>
            {caseRecord.assignee ? (
              <Badge variant='outline'>Owner: {caseRecord.assignee.name}</Badge>
            ) : (
              <Badge variant='outline'>Unassigned</Badge>
            )}
          </div>
          <p className='text-sm leading-relaxed'>
            {caseRecord.next_step ?? 'Review intake and make first contact.'}
          </p>
          <p className='text-muted-foreground text-xs'>
            Follow-up: {formatCaseDate(caseRecord.follow_up_at)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export async function CaseListing() {
  await requireCommitteeMember();

  const supabase = await createClient();
  const { data } = await supabase
    .from('cases')
    .select(CASE_LIST_SELECT)
    .order('created_at', { ascending: false });

  const cases = coerceCaseRecords(data).filter(Boolean);

  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className='py-10 text-center'>
          <h2 className='text-lg font-semibold'>No cases yet</h2>
          <p className='text-muted-foreground mt-2 text-sm'>
            New intake submissions will appear here automatically.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='py-4'>
            <p className='text-muted-foreground text-sm'>Open cases</p>
            <p className='text-2xl font-semibold'>{getOpenCaseCount(cases)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='py-4'>
            <p className='text-muted-foreground text-sm'>New intakes</p>
            <p className='text-2xl font-semibold'>
              {cases.filter((caseRecord) => caseRecord.status === 'new').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='py-4'>
            <p className='text-muted-foreground text-sm'>Overdue follow-ups</p>
            <p className='text-2xl font-semibold'>{getOverdueCount(cases)}</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
        {cases.map((caseRecord) => (
          <CaseCard key={caseRecord.id} caseRecord={caseRecord} />
        ))}
      </div>
    </div>
  );
}
