import PageContainer from '@/components/layout/page-container';
import { AppearanceSettings } from '@/features/settings/components/appearance-settings';
import { AiModelSettings } from '@/features/settings/components/ai-model-settings';
import { getAiModelSettingForDashboard } from '@/lib/app-settings';
import { requireCommitteeMember } from '@/lib/case-auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard: Settings'
};

export default async function SettingsPage() {
  await requireCommitteeMember();
  const aiModel = await getAiModelSettingForDashboard();

  return (
    <PageContainer
      pageTitle='Settings'
      pageDescription='Configure committee tools and AI helpers.'
    >
      <div className='flex flex-col gap-4'>
        <AppearanceSettings />
        <AiModelSettings initialModel={aiModel} />
      </div>
    </PageContainer>
  );
}
