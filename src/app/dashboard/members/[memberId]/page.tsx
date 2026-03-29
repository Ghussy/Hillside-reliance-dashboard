import PageContainer from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import {
  MEMBER_PHOTOS_BUCKET,
  SIGNED_URL_EXPIRY,
  isStoragePath,
  getCachedSignedUrl,
  setCachedSignedUrl
} from '@/lib/member-photo';
import { MemberDetailClient } from '@/features/members/components/member-detail-client';
import { createClient } from '@/supabase/server';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard: Member Detail'
};

type PageProps = {
  params: Promise<{ memberId: string }>;
};

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

export default async function MemberDetailPage(props: PageProps) {
  const { memberId } = await props.params;
  const supabase = await createClient();

  const { data: member } = await supabase
    .from('members')
    .select(
      'id, auth_id, name, email, phone, photo_url, household_name, address, status, role, callings, synced_at, created_at, updated_at, email_manual, phone_manual'
    )
    .eq('id', memberId)
    .single();

  if (!member) {
    notFound();
  }

  if (isStoragePath(member.photo_url)) {
    const cached = getCachedSignedUrl(member.photo_url);
    if (cached) {
      member.photo_url = cached;
    } else {
      const { data: signed } = await supabase.storage
        .from(MEMBER_PHOTOS_BUCKET)
        .createSignedUrl(member.photo_url, SIGNED_URL_EXPIRY);
      if (signed?.signedUrl) {
        setCachedSignedUrl(member.photo_url, signed.signedUrl);
        member.photo_url = signed.signedUrl;
      }
    }
  }

  const syncLabel = member.synced_at
    ? `Synced ${compactTimeAgo(new Date(member.synced_at))}`
    : 'Never synced';

  return (
    <PageContainer pageTitle='Member Detail'>
      <div className='mx-auto max-w-sm'>
        <Card className='overflow-hidden'>
          <MemberDetailClient member={member} syncLabel={syncLabel} />
        </Card>
      </div>
    </PageContainer>
  );
}
