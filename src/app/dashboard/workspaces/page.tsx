import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { workspacesInfoContent } from '@/config/infoconfig';

export default function WorkspacesPage() {
  return (
    <PageContainer
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces'
      infoContent={workspacesInfoContent}
    >
      <Card>
        <CardHeader>
          <CardTitle>Workspaces</CardTitle>
          <CardDescription>
            Workspace management is coming soon. Currently all authenticated
            users have access to the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>
            Organization and team features will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
