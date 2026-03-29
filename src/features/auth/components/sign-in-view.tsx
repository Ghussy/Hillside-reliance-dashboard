'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/supabase/client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type AuthStep = 'email' | 'email-sent' | 'email-code';

function formatAuthError(err: unknown): string {
  const code =
    err &&
    typeof err === 'object' &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string'
      ? (err as { code: string }).code
      : null;

  if (
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit'
  ) {
    return 'Too many sign-in emails were sent. Wait several minutes before requesting another, or use the 6-digit code from your most recent email. Supabase limits how many auth emails can be sent per hour.';
  }

  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes('rate limit') || msg.includes('too many')) {
      return 'Email rate limit exceeded. Wait before trying again or use an existing code from your inbox.';
    }
    return err.message;
  }

  return 'An error occurred';
}

export default function SignInViewPage() {
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });
      if (error) throw error;
      setStep('email-sent');
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: emailCode,
        type: 'email'
      });
      if (error) throw error;
      router.push('/dashboard/overview');
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      {/* Left panel — painting */}
      <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
        <Image
          src='/login-shepherd-blue.png'
          alt='Painting of the Good Shepherd with sheep in a field'
          fill
          priority
          className='object-cover object-center'
        />
        <div className='animate-painting-bloom pointer-events-none absolute inset-0 mix-blend-screen'>
          <Image
            src='/login-shepherd-blue.png'
            alt=''
            fill
            className='object-cover object-center blur-md brightness-[1.6] contrast-[2.2] saturate-[2.5]'
          />
        </div>
        <div className='absolute inset-0 bg-black/18' />
        <div className='absolute inset-0 bg-linear-to-b from-black/14 via-transparent to-black/38' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-2 size-6'
            aria-hidden='true'
          >
            <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
          </svg>
          Hillside Self-Reliance
        </div>
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;Helping families become self-reliant through faith,
              education, and community support.&rdquo;
            </p>
            <footer className='text-sm'>Hillside Ward</footer>
          </blockquote>
        </div>
      </div>

      {/* Right panel — Auth forms */}
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-sm flex-col gap-6'>
          <div className='space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Committee Login
            </h1>
            <p className='text-muted-foreground text-sm'>
              {step === 'email' && 'Enter your email to receive a magic link'}
              {step === 'email-sent' &&
                'Check your inbox for a sign-in link or code'}
              {step === 'email-code' &&
                'Enter the 6-digit code from your email'}
            </p>
          </div>

          {/* ── Email entry ── */}
          {step === 'email' && (
            <form
              onSubmit={handleSendMagicLink}
              className='flex flex-col gap-4'
            >
              <div className='grid gap-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='name@example.com'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className='text-sm text-red-500'>{error}</p>}
              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Magic Link'}
              </Button>
            </form>
          )}

          {/* ── Email sent — magic link or manual code ── */}
          {step === 'email-sent' && (
            <div className='flex flex-col gap-4'>
              <p className='text-muted-foreground text-center text-sm'>
                We sent a sign-in link to <strong>{email}</strong>.
                <br />
                Click the link in your email, or enter the code below.
              </p>
              <div className='flex items-center gap-4'>
                <Separator className='flex-1' />
                <span className='text-muted-foreground text-xs uppercase'>
                  or
                </span>
                <Separator className='flex-1' />
              </div>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => {
                  setStep('email-code');
                  setError(null);
                }}
              >
                Enter code manually
              </Button>
              <Button
                variant='ghost'
                className='w-full'
                onClick={() => {
                  setStep('email');
                  setError(null);
                }}
              >
                Use a different email
              </Button>
            </div>
          )}

          {/* ── Manual code entry (fallback) ── */}
          {step === 'email-code' && (
            <form
              onSubmit={handleVerifyEmailCode}
              className='flex flex-col gap-4'
            >
              <div className='flex flex-col items-center gap-2'>
                <Label>Verification Code</Label>
                <InputOTP
                  maxLength={6}
                  value={emailCode}
                  onChange={(value) => setEmailCode(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <p className='text-muted-foreground text-xs'>
                  Code sent to <strong>{email}</strong>
                </p>
              </div>
              {error && <p className='text-sm text-red-500'>{error}</p>}
              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>
              <Button
                type='button'
                variant='ghost'
                className='w-full'
                onClick={() => {
                  setStep('email-sent');
                  setEmailCode('');
                  setError(null);
                }}
              >
                Back
              </Button>
            </form>
          )}

          <p className='text-muted-foreground px-8 text-center text-xs'>
            Access is limited to Hillside committee members.
            <br />
            Contact your administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
