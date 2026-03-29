import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

const recentActivity = [
  {
    name: 'Sarah Thompson',
    fallback: 'ST',
    action: 'New calling assigned',
    detail: 'Primary Teacher',
    type: 'calling' as const
  },
  {
    name: 'James Mitchell',
    fallback: 'JM',
    action: 'Moved in',
    detail: 'From Riverside Ward',
    type: 'move' as const
  },
  {
    name: 'Emily Carter',
    fallback: 'EC',
    action: 'Calling released',
    detail: 'YW Secretary',
    type: 'calling' as const
  },
  {
    name: 'David Rodriguez',
    fallback: 'DR',
    action: 'Added to committee',
    detail: 'Activities Committee',
    type: 'committee' as const
  },
  {
    name: 'Rachel Kim',
    fallback: 'RK',
    action: 'Contact updated',
    detail: 'Phone & address',
    type: 'update' as const
  }
];

const typeBadge: Record<string, string> = {
  calling: 'Calling',
  move: 'Move',
  committee: 'Committee',
  update: 'Update'
};

export function RecentSales() {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>5 changes in the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-6'>
          {recentActivity.map((item, index) => (
            <div key={index} className='flex items-center gap-4'>
              <Avatar className='size-9'>
                <AvatarFallback>{item.fallback}</AvatarFallback>
              </Avatar>
              <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <p className='truncate text-sm leading-none font-medium'>
                  {item.name}
                </p>
                <p className='text-muted-foreground truncate text-sm'>
                  {item.action} &middot; {item.detail}
                </p>
              </div>
              <Badge variant='secondary' className='shrink-0'>
                {typeBadge[item.type]}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
