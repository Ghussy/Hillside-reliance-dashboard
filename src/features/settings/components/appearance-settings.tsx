'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ThemeModeToggle } from '@/components/themes/theme-mode-toggle';
import { ThemeSelector } from '@/components/themes/theme-selector';

export function AppearanceSettings() {
  return (
    <Card className='max-w-2xl'>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Change the dashboard theme and light/dark mode here instead of taking
          up space in the mobile header.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4 sm:flex-row sm:items-center'>
        <ThemeModeToggle />
        <ThemeSelector />
      </CardContent>
    </Card>
  );
}
