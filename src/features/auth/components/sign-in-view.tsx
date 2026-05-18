'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/supabase/client';
import type { Value as E164Value } from 'react-phone-number-input';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type EmailStep = 'email' | 'email-sent' | 'email-code';
type PhoneStep = 'phone' | 'phone-sent' | 'phone-code';

function formatAuthError(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'An error occurred';
}

function maskPhoneTail(e164: string): string {
  const d = e164.replace(/\D/g, '');
  const last4 = d.slice(-4);
  return last4 ? `••••••${last4}` : e164;
}

export default function SignInViewPage() {
  const [tab, setTab] = useState<'email' | 'phone'>('email');

  const [emailStep, setEmailStep] = useState<EmailStep>('email');
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');

  const [phoneStep, setPhoneStep] = useState<PhoneStep>('phone');
  const [phoneValue, setPhoneValue] = useState<E164Value>('' as E164Value);
  const [phoneE164, setPhoneE164] = useState('');
  const [phoneCode, setPhoneCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleTabChange = (value: string): void => {
    const next = value === 'phone' ? 'phone' : 'email';
    setTab(next);
    setError(null);
    if (next === 'email') {
      setPhoneStep('phone');
      setPhoneValue('' as E164Value);
      setPhoneE164('');
      setPhoneCode('');
    } else {
      setEmailStep('email');
      setEmail('');
      setEmailCode('');
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });
      if (otpError) throw otpError;
      setEmailStep('email-sent');
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
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: emailCode,
        type: 'email'
      });
      if (verifyError) throw verifyError;
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const e164 = phoneValue?.trim();
    if (!e164?.startsWith('+')) {
      setError('Enter a valid phone number');
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: e164
      });
      if (otpError) throw otpError;
      setPhoneE164(e164);
      setPhoneStep('phone-sent');
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneE164) {
      setError('Send a code first.');
      return;
    }
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: phoneE164,
        token: phoneCode,
        type: 'sms'
      });
      if (verifyError) throw verifyError;
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const emailSubtitle =
    emailStep === 'email'
      ? 'Enter your email to receive a magic link'
      : emailStep === 'email-sent'
        ? 'Check your inbox for a sign-in link or code'
        : 'Enter the 6-digit code from your email';

  const phoneSubtitle =
    phoneStep === 'phone'
      ? 'Enter your mobile number to receive a text code'
      : phoneStep === 'phone-sent'
        ? 'Check your messages for a 6-digit code'
        : 'Enter the code we texted you';

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
              &ldquo;Helping members become self-reliant through faith,
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
              {tab === 'email' ? emailSubtitle : phoneSubtitle}
            </p>
          </div>

          <Tabs
            value={tab}
            onValueChange={handleTabChange}
            className='w-full gap-4'
          >
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='email'>Email</TabsTrigger>
              <TabsTrigger value='phone'>Phone</TabsTrigger>
            </TabsList>

            <TabsContent value='email' className='mt-0 flex flex-col gap-4'>
              {emailStep === 'email' && (
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

              {emailStep === 'email-sent' && (
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
                      setEmailStep('email-code');
                      setError(null);
                    }}
                  >
                    Enter code manually
                  </Button>
                  <Button
                    variant='ghost'
                    className='w-full'
                    onClick={() => {
                      setEmailStep('email');
                      setError(null);
                    }}
                  >
                    Use a different email
                  </Button>
                </div>
              )}

              {emailStep === 'email-code' && (
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
                      setEmailStep('email-sent');
                      setEmailCode('');
                      setError(null);
                    }}
                  >
                    Back
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value='phone' className='mt-0 flex flex-col gap-4'>
              {phoneStep === 'phone' && (
                <form
                  onSubmit={handleSendPhoneOtp}
                  className='flex flex-col gap-4'
                >
                  <div className='grid gap-2'>
                    <Label>Mobile number</Label>
                    <PhoneInput
                      defaultCountry='US'
                      international
                      value={phoneValue}
                      onChange={(v) => setPhoneValue(v || ('' as E164Value))}
                      placeholder='(801) 555-0123'
                    />
                  </div>
                  {error && <p className='text-sm text-red-500'>{error}</p>}
                  <Button type='submit' className='w-full' disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send text code'}
                  </Button>
                </form>
              )}

              {phoneStep === 'phone-sent' && (
                <div className='flex flex-col gap-4'>
                  <p className='text-muted-foreground text-center text-sm'>
                    We sent a code to{' '}
                    <strong>{maskPhoneTail(phoneE164)}</strong>
                    .
                    <br />
                    Enter it on the next screen when you are ready.
                  </p>
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={() => {
                      setPhoneStep('phone-code');
                      setError(null);
                    }}
                  >
                    Enter code
                  </Button>
                  <Button
                    variant='ghost'
                    className='w-full'
                    onClick={() => {
                      setPhoneStep('phone');
                      setPhoneValue('' as E164Value);
                      setPhoneE164('');
                      setError(null);
                    }}
                  >
                    Use a different number
                  </Button>
                </div>
              )}

              {phoneStep === 'phone-code' && (
                <form
                  onSubmit={handleVerifyPhoneCode}
                  className='flex flex-col gap-4'
                >
                  <div className='flex flex-col items-center gap-2'>
                    <Label>Text code</Label>
                    <InputOTP
                      maxLength={6}
                      value={phoneCode}
                      onChange={(value) => setPhoneCode(value)}
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
                      Sent to <strong>{maskPhoneTail(phoneE164)}</strong>
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
                      setPhoneStep('phone-sent');
                      setPhoneCode('');
                      setError(null);
                    }}
                  >
                    Back
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <p className='text-muted-foreground px-8 text-center text-xs'>
            Access is limited to Hillside committee members.
          </p>
        </div>
      </div>
    </div>
  );
}
