'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
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
  { date: '2025-10-05', attended: 14, homework: 8 },
  { date: '2025-10-12', attended: 16, homework: 10 },
  { date: '2025-10-19', attended: 15, homework: 9 },
  { date: '2025-10-26', attended: 18, homework: 12 },
  { date: '2025-11-02', attended: 17, homework: 11 },
  { date: '2025-11-09', attended: 20, homework: 14 },
  { date: '2025-11-16', attended: 19, homework: 13 },
  { date: '2025-11-23', attended: 16, homework: 10 },
  { date: '2025-11-30', attended: 21, homework: 15 },
  { date: '2025-12-07', attended: 22, homework: 16 },
  { date: '2025-12-14', attended: 24, homework: 18 },
  { date: '2025-12-21', attended: 18, homework: 11 },
  { date: '2025-12-28', attended: 15, homework: 8 },
  { date: '2026-01-04', attended: 23, homework: 17 },
  { date: '2026-01-11', attended: 25, homework: 19 },
  { date: '2026-01-18', attended: 26, homework: 20 },
  { date: '2026-01-25', attended: 24, homework: 18 },
  { date: '2026-02-01', attended: 28, homework: 22 },
  { date: '2026-02-08', attended: 27, homework: 21 },
  { date: '2026-02-15', attended: 29, homework: 23 },
  { date: '2026-02-22', attended: 30, homework: 24 },
  { date: '2026-03-01', attended: 31, homework: 25 },
  { date: '2026-03-08', attended: 33, homework: 27 },
  { date: '2026-03-15', attended: 34, homework: 28 },
  { date: '2026-03-22', attended: 35, homework: 29 }
];

const chartConfig = {
  views: {
    label: 'Participants'
  },
  attended: {
    label: 'Attended',
    color: 'var(--primary)'
  },
  homework: {
    label: 'Homework Done',
    color: 'var(--primary)'
  }
} satisfies ChartConfig;

export function BarGraph() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('attended');

  const avg = React.useMemo(
    () => ({
      attended: Math.round(
        chartData.reduce((acc, curr) => acc + curr.attended, 0) /
          chartData.length
      ),
      homework: Math.round(
        chartData.reduce((acc, curr) => acc + curr.homework, 0) /
          chartData.length
      )
    }),
    []
  );

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <Card className='@container/card !pt-3'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 !py-0'>
          <CardTitle>Emotional Resilience Class</CardTitle>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>
              Weekly enrollment and attendance over 6 months
            </span>
            <span className='@[540px]/card:hidden'>Last 6 months</span>
          </CardDescription>
        </div>
        <div className='flex'>
          {(['attended', 'homework'] as const).map((key) => {
            return (
              <button
                key={key}
                data-active={activeChart === key}
                className='data-[active=true]:bg-primary/5 hover:bg-primary/5 relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left transition-colors duration-200 even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6'
                onClick={() => setActiveChart(key)}
              >
                <span className='text-muted-foreground text-xs'>
                  Avg {chartConfig[key].label}
                </span>
                <span className='text-lg leading-none font-bold sm:text-3xl'>
                  {avg[key]}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <BarChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillBar' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='0%'
                  stopColor='var(--primary)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='100%'
                  stopColor='var(--primary)'
                  stopOpacity={0.2}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });
              }}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey='views'
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    });
                  }}
                />
              }
            />
            <Bar
              dataKey={activeChart}
              fill='url(#fillBar)'
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
