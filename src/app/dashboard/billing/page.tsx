import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { billingInfoContent } from '@/config/infoconfig';

export default function BillingPage() {
  return (
    <PageContainer
      infoContent={billingInfoContent}
      pageTitle='Billing & Plans'
      pageDescription='Manage your subscription and billing'
    >
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>
            Billing and subscription management is coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>
            Plan selection and payment features will be available in a future
            update.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
