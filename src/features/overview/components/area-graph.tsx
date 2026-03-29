'use client';

import { IconTrendingUp } from '@tabler/icons-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

const chartData = [
  { month: 'October', active: 462, withCallings: 198 },
  { month: 'November', active: 468, withCallings: 205 },
  { month: 'December', active: 471, withCallings: 210 },
  { month: 'January', active: 475, withCallings: 212 },
  { month: 'February', active: 480, withCallings: 218 },
  { month: 'March', active: 487, withCallings: 214 }
];

const chartConfig = {
  membership: {
    label: 'Membership'
  },
  active: {
    label: 'Active Members',
    color: 'var(--primary)'
  },
  withCallings: {
    label: 'With Callings',
    color: 'var(--primary)'
  }
} satisfies ChartConfig;

export function AreaGraph() {
  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Membership Trend</CardTitle>
        <CardDescription>
          Active members and callings over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillDesktop' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-desktop)'
                  stopOpacity={1.0}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-desktop)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillMobile' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-mobile)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-mobile)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dot' />}
            />
            <Area
              dataKey='withCallings'
              type='natural'
              fill='url(#fillMobile)'
              stroke='var(--color-withCallings)'
            />
            <Area
              dataKey='active'
              type='natural'
              fill='url(#fillDesktop)'
              stroke='var(--color-active)'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 leading-none font-medium'>
              Membership up 5.4% this period{' '}
              <IconTrendingUp className='h-4 w-4' />
            </div>
            <div className='text-muted-foreground flex items-center gap-2 leading-none'>
              October 2025 &ndash; March 2026
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
