'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/hooks/use-auth';
import { createClient } from '@/supabase/client';
import { useState } from 'react';

export default function ProfileViewPage() {
  const { user } = useUser();
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (error) throw error;
      setMessage('Profile updated successfully');
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex w-full flex-col gap-6 p-4'>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className='space-y-4'>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={user?.email || ''}
                disabled
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='full-name'>Full Name</Label>
              <Input
                id='full-name'
                type='text'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder='Enter your full name'
              />
            </div>
            {message && (
              <p className='text-sm text-green-600 dark:text-green-400'>
                {message}
              </p>
            )}
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your password</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant='outline'
            onClick={async () => {
              const supabase = createClient();
              if (user?.email) {
                await supabase.auth.resetPasswordForEmail(user.email, {
                  redirectTo: `${window.location.origin}/auth/update-password`
                });
                setMessage('Password reset email sent');
              }
            }}
          >
            Send Password Reset Email
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
