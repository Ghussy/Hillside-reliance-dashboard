'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DottedGlowBackground } from '@/components/ui/dotted-glow-background';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import { SyncStatus } from '@/features/members/components/sync-status';
import { ROLE_OPTIONS } from '@/features/members/components/member-tables/options';
import { createClient } from '@/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Calling, Member } from '@/types';

import {
  MailCheckIcon,
  type MailCheckIconHandle
} from '@/components/ui/mail-check';
import { MapPinIcon, type MapPinIconHandle } from '@/components/ui/map-pin';
import {
  ShieldCheckIcon,
  type ShieldCheckIconHandle
} from '@/components/ui/shield-check';
import { BookTextIcon } from '@/components/ui/book-text';
import { SquarePenIcon } from '@/components/ui/square-pen';
import { XIcon } from '@/components/ui/x';
import { CheckIcon } from '@/components/ui/check';
import { Phone } from 'lucide-react';

type MemberForDetail = Member & {
  auth_id: string | null;
  created_at: string | null;
};

type MemberDetailClientProps = {
  member: MemberForDetail;
  syncLabel: string;
  className?: string;
};

export function MemberDetailClient({
  member: initial,
  syncLabel,
  className
}: MemberDetailClientProps) {
  const [member, setMember] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    email: initial.email ?? '',
    phone: initial.phone ?? '',
    address: initial.address ?? '',
    role: initial.role
  });

  const emailIconRef = useRef<MailCheckIconHandle>(null);
  const mapPinIconRef = useRef<MapPinIconHandle>(null);
  const shieldIconRef = useRef<ShieldCheckIconHandle>(null);

  const callings = (member.callings ?? []) as Calling[];
  const phoneDigits = member.phone?.replace(/\D/g, '');
  const googleMapsUrl = member.address
    ? `https://maps.google.com/?q=${encodeURIComponent(member.address)}`
    : null;

  const handleSave = useCallback(async () => {
    setSaving(true);
    const supabase = createClient();

    const emailChanged = draft.email !== (initial.email ?? '');
    const phoneChanged = draft.phone !== (initial.phone ?? '');

    const { error } = await supabase
      .from('members')
      .update({
        email: draft.email || null,
        phone: draft.phone || null,
        address: draft.address || null,
        role: draft.role,
        ...(emailChanged && { email_manual: true }),
        ...(phoneChanged && { phone_manual: true })
      })
      .eq('id', member.id);

    setSaving(false);

    if (error) {
      toast.error('Failed to save changes');
      return;
    }

    setMember((prev) => ({
      ...prev,
      email: draft.email || null,
      phone: draft.phone || null,
      address: draft.address || null,
      role: draft.role,
      email_manual: emailChanged ? true : prev.email_manual,
      phone_manual: phoneChanged ? true : prev.phone_manual
    }));
    setEditing(false);
    toast.success('Member updated');
  }, [draft, member.id, initial.email, initial.phone]);

  const handleCancel = () => {
    setDraft({
      email: member.email ?? '',
      phone: member.phone ?? '',
      address: member.address ?? '',
      role: member.role
    });
    setEditing(false);
  };

  const handleEdit = () => {
    setDraft({
      email: member.email ?? '',
      phone: member.phone ?? '',
      address: member.address ?? '',
      role: member.role
    });
    setEditing(true);
  };

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden px-4 pt-6 pb-8 sm:px-6 sm:pt-10',
        className
      )}
    >
      {/* ── Avatar + identity ── */}
      <div className='flex flex-col items-center text-center'>
        <div className='relative mb-6 flex items-center justify-center sm:mb-8'>
          <div className='absolute -inset-10 overflow-hidden rounded-full sm:-inset-16'>
            <DottedGlowBackground
              className='pointer-events-none mask-radial-to-90% mask-radial-at-center'
              opacity={1}
              gap={10}
              radius={1.6}
              colorLightVar='--color-neutral-500'
              glowColorLightVar='--color-neutral-600'
              colorDarkVar='--color-neutral-500'
              glowColorDarkVar='--color-sky-800'
              backgroundOpacity={0}
              speedMin={0.3}
              speedMax={1.6}
              speedScale={1}
            />
          </div>
          <MemberAvatar
            className='relative size-28 text-2xl sm:size-36 sm:text-3xl'
            member={member}
          />
        </div>

        <h1 className='text-xl font-semibold tracking-tight'>{member.name}</h1>

        <div className='mt-2.5'>
          <SyncStatus label={syncLabel} />
        </div>
      </div>

      {/* ── Edit row ── */}
      <div className='mt-4 flex items-center justify-center gap-2'>
        {!editing ? (
          <Button
            variant='outline'
            size='sm'
            className='h-11 w-full sm:h-10'
            onClick={handleEdit}
          >
            <SquarePenIcon size={14} className='text-muted-foreground' />
            Edit
          </Button>
        ) : (
          <>
            <Button
              variant='ghost'
              size='sm'
              className='h-11 flex-1 sm:h-10'
              onClick={handleCancel}
              disabled={saving}
            >
              <XIcon size={14} />
              Cancel
            </Button>
            <Button
              size='sm'
              className='h-11 flex-1 sm:h-10'
              onClick={handleSave}
              disabled={saving}
            >
              <CheckIcon size={14} />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      </div>

      {/* ── Contact fields ── */}
      <Separator className='mt-5 mb-6' />

      <div className='flex flex-col gap-5'>
        {/* Email */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative hover animation */}
        <div
          className='flex min-h-12 items-center gap-3 rounded-lg px-2 py-2'
          onMouseEnter={() => emailIconRef.current?.startAnimation()}
          onMouseLeave={() => emailIconRef.current?.stopAnimation()}
        >
          <MailCheckIcon
            ref={emailIconRef}
            size={16}
            className='text-muted-foreground shrink-0'
          />
          {editing ? (
            <Input
              id='member-email'
              type='email'
              value={draft.email}
              onChange={(e) =>
                setDraft((d) => ({ ...d, email: e.target.value }))
              }
              placeholder='email@example.com'
            />
          ) : member.email ? (
            <a
              href={`mailto:${member.email}`}
              className='min-w-0 truncate text-base underline-offset-4 hover:underline sm:text-sm'
            >
              {member.email}
            </a>
          ) : (
            <span className='text-muted-foreground text-sm'>–</span>
          )}
        </div>

        {/* Phone */}
        <div className='flex min-h-12 items-center gap-3 rounded-lg px-2 py-2'>
          <Phone className='text-muted-foreground size-4 shrink-0' />
          {editing ? (
            <Input
              id='member-phone'
              type='tel'
              value={draft.phone}
              onChange={(e) =>
                setDraft((d) => ({ ...d, phone: e.target.value }))
              }
              placeholder='(555) 123-4567'
            />
          ) : member.phone ? (
            <a
              href={`sms:${phoneDigits}`}
              className='text-base underline-offset-4 hover:underline sm:text-sm'
            >
              {member.phone}
            </a>
          ) : (
            <span className='text-muted-foreground text-sm'>–</span>
          )}
        </div>

        {/* Address */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative hover animation */}
        <div
          className='flex min-h-12 items-center gap-3 rounded-lg px-2 py-2'
          onMouseEnter={() => mapPinIconRef.current?.startAnimation()}
          onMouseLeave={() => mapPinIconRef.current?.stopAnimation()}
        >
          <MapPinIcon
            ref={mapPinIconRef}
            size={16}
            className='text-muted-foreground shrink-0'
          />
          {editing ? (
            <Input
              id='member-address'
              value={draft.address}
              onChange={(e) =>
                setDraft((d) => ({ ...d, address: e.target.value }))
              }
              placeholder='123 Main St, City, State'
            />
          ) : member.address ? (
            <a
              href={googleMapsUrl ?? '#'}
              target='_blank'
              rel='noopener noreferrer'
              className='min-w-0 truncate text-base underline-offset-4 hover:underline sm:text-sm'
            >
              {member.address}
            </a>
          ) : (
            <span className='text-muted-foreground text-sm'>–</span>
          )}
        </div>

        {/* Role */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative hover animation */}
        <div
          className='flex min-h-12 items-center gap-3 rounded-lg px-2 py-2'
          onMouseEnter={() => shieldIconRef.current?.startAnimation()}
          onMouseLeave={() => shieldIconRef.current?.stopAnimation()}
        >
          <ShieldCheckIcon
            ref={shieldIconRef}
            size={16}
            className='text-muted-foreground shrink-0'
          />
          {editing ? (
            <Select
              value={draft.role}
              onValueChange={(v) => setDraft((d) => ({ ...d, role: v }))}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ROLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <span className='text-base capitalize sm:text-sm'>
              {member.role}
            </span>
          )}
        </div>
      </div>

      {/* ── Callings ── */}
      <Separator className='mt-6 mb-5' />

      <div className='flex flex-col gap-3'>
        <span className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
          Callings
        </span>
        {callings.length > 0 ? (
          callings.map((c) => (
            <div
              key={`${c.name}-${c.organization}`}
              className='flex min-h-12 items-center gap-3 rounded-lg px-2 py-2'
            >
              <div className='bg-muted flex size-8 shrink-0 items-center justify-center rounded-md'>
                <BookTextIcon size={14} className='text-muted-foreground' />
              </div>
              <div className='flex min-w-0 flex-col'>
                <span className='truncate text-sm font-medium'>{c.name}</span>
                {c.organization && (
                  <span className='text-muted-foreground truncate text-xs'>
                    {c.organization}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <span className='text-muted-foreground text-sm'>
            No callings assigned
          </span>
        )}
      </div>
    </div>
  );
}
