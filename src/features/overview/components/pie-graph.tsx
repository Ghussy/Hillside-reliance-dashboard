'use client';

import * as React from 'react';
import { IconTrendingUp } from '@tabler/icons-react';
import { Label, Pie, PieChart } from 'recharts';

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
  { role: 'member', count: 449, fill: 'var(--primary)' },
  { role: 'committee', count: 32, fill: 'var(--primary)' },
  { role: 'admin', count: 6, fill: 'var(--primary)' }
];

const chartConfig = {
  count: {
    label: 'Members'
  },
  member: {
    label: 'Members',
    color: 'var(--primary)'
  },
  committee: {
    label: 'Committee',
    color: 'var(--primary)'
  },
  admin: {
    label: 'Admin',
    color: 'var(--primary)'
  }
} satisfies ChartConfig;

export function PieGraph() {
  const totalMembers = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, []);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Member Roles</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Distribution of roles across active members
          </span>
          <span className='@[540px]/card:hidden'>Role distribution</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[250px]'
        >
          <PieChart>
            <defs>
              {['member', 'committee', 'admin'].map((role, index) => (
                <linearGradient
                  key={role}
                  id={`fill${role}`}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='0%'
                    stopColor='var(--primary)'
                    stopOpacity={1 - index * 0.25}
                  />
                  <stop
                    offset='100%'
                    stopColor='var(--primary)'
                    stopOpacity={0.8 - index * 0.25}
                  />
                </linearGradient>
              ))}
            </defs>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData.map((item) => ({
                ...item,
                fill: `url(#fill${item.role})`
              }))}
              dataKey='count'
              nameKey='role'
              innerRadius={60}
              strokeWidth={2}
              stroke='var(--background)'
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalMembers.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Total Members
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none font-medium'>
          {((chartData[1].count / totalMembers) * 100).toFixed(1)}% are
          committee or admin <IconTrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          Current ward roster
        </div>
      </CardFooter>
    </Card>
  );
}
