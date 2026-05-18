import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { IntakeForm } from '@/features/intake/components/intake-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Member Assistance Intake',
  description:
    'Public intake form for requesting member assistance and coordinating follow-up.',
  robots: {
    index: false,
    follow: false
  }
};

export default function IntakePage() {
  return (
    <main className='via-background to-background relative min-h-screen overflow-hidden bg-linear-to-b from-orange-50/80 px-3 py-6 sm:px-6 sm:py-12 lg:px-8 dark:from-orange-950/20'>
      <div className='pointer-events-none absolute -top-36 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-300/55 blur-3xl sm:-top-48 sm:h-128 sm:w-lg dark:bg-orange-500/25' />
      <div className='pointer-events-none absolute top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-200/45 blur-2xl sm:h-56 sm:w-56 dark:bg-amber-400/15' />

      <div className='relative mx-auto flex max-w-4xl flex-col gap-5 sm:gap-8'>
        <div className='text-center'>
          <p className='text-sm font-medium tracking-wide text-orange-700 uppercase dark:text-orange-300'>
            Member Assistance
          </p>
          <h1 className='text-foreground mt-2 text-2xl font-bold tracking-tight sm:mt-3 sm:text-4xl'>
            Assistance Intake Form
          </h1>
          <p className='text-muted-foreground mx-auto mt-3 max-w-2xl text-base leading-relaxed sm:mt-4 sm:text-lg'>
            This form collects the information needed to understand the
            situation, determine what help may be appropriate, and coordinate
            follow-up.
          </p>
        </div>

        <Alert className='dark:bg-card/80 border-orange-200/80 bg-white/80 shadow-sm backdrop-blur dark:border-orange-900/60'>
          <AlertTitle>What we are collecting</AlertTitle>
          <AlertDescription>
            Please share only information that is helpful for understanding the
            need. Details may be shared with appropriate leaders or helpers for
            follow-up when permission is given.
          </AlertDescription>
        </Alert>

        <IntakeForm />
      </div>
    </main>
  );
}
