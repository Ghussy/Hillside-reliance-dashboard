'use client';

import { FormCheckboxGroup } from '@/components/forms/form-checkbox-group';
import { FormInput } from '@/components/forms/form-input';
import { FormRadioGroup } from '@/components/forms/form-radio-group';
import { FormTextarea } from '@/components/forms/form-textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import {
  assistanceTypeOptions,
  contactMethodOptions,
  intakeDefaultValues,
  intakeSchema,
  urgencyLevelOptions,
  type IntakeFormValues
} from '@/features/intake/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type SubmitState = 'idle' | 'success' | 'error';

const cardClassName =
  'gap-4 rounded-2xl border-orange-100/80 bg-white/90 py-4 shadow-sm backdrop-blur sm:gap-6 sm:py-6 dark:border-orange-950/40 dark:bg-card/90';
const cardHeaderClassName = 'px-4 sm:px-6';
const cardTitleClassName = 'text-lg leading-snug sm:text-xl';
const cardDescriptionClassName = 'text-sm leading-relaxed sm:text-base';
const sectionKickerClassName =
  'text-orange-700 text-xs font-semibold tracking-wide uppercase dark:text-orange-300';
const cardContentClassName = 'flex flex-col gap-5 px-4 sm:gap-6 sm:px-6';
const fieldGridClassName = 'grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2';

const workTypes = new Set([
  'employment',
  'resume',
  'interview_prep',
  'career_direction'
]);
const practicalTypes = new Set(['budgeting', 'debt', 'housing']);
const supportTypes = new Set(['mental_health', 'social_connection']);

function hasAnySelection(values: string[], options: Set<string>) {
  return values.some((value) => options.has(value));
}

function IntakeForm() {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: intakeDefaultValues
  });

  const assistanceTypes = form.watch('assistanceTypes') ?? [];
  const urgencyLevel = form.watch('urgencyLevel');
  const preferredContactMethod = form.watch('preferredContactMethod');
  const showWorkDetails = hasAnySelection(assistanceTypes, workTypes);
  const showPracticalDetails = hasAnySelection(assistanceTypes, practicalTypes);
  const showSupportDetails = hasAnySelection(assistanceTypes, supportTypes);
  const showOtherDetails = assistanceTypes.includes('other');
  const showUrgentDetails = urgencyLevel === 'immediate';
  const showHelpfulDetails =
    assistanceTypes.length > 0 &&
    (showWorkDetails ||
      showPracticalDetails ||
      showSupportDetails ||
      showOtherDetails ||
      showUrgentDetails);
  const showPhone =
    preferredContactMethod === 'text' ||
    preferredContactMethod === 'phone' ||
    preferredContactMethod === 'any';
  const showEmail =
    preferredContactMethod === 'email' || preferredContactMethod === 'any';
  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: IntakeFormValues) {
    setSubmitState('idle');

    const response = await fetch('/api/intake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      setSubmitState('error');
      toast.error('We could not submit the request. Please try again.');
      return;
    }

    form.reset(intakeDefaultValues);
    setSubmitState('success');
    toast.success('Your request has been submitted.');
  }

  return (
    <Form
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className='flex flex-col gap-5 pb-24 **:data-[slot=form-description]:text-[13px] **:data-[slot=form-description]:leading-relaxed **:data-[slot=form-label]:text-[15px] **:data-[slot=form-label]:leading-snug **:data-[slot=form-message]:text-[13px] **:data-[slot=form-message]:leading-relaxed sm:gap-7 sm:pb-0'
    >
      {submitState === 'success' ? (
        <Alert>
          <AlertTitle>Request submitted</AlertTitle>
          <AlertDescription>
            Thank you. Someone from the committee will review this and follow up
            in the way you requested.
          </AlertDescription>
        </Alert>
      ) : null}

      {submitState === 'error' ? (
        <Alert variant='destructive'>
          <AlertTitle>Submission failed</AlertTitle>
          <AlertDescription>
            Please check your information and try again. If the need is urgent,
            contact a bishopric member or emergency services right away.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className={cardClassName}>
        <CardHeader className={cardHeaderClassName}>
          <p className={sectionKickerClassName}>Start here</p>
          <CardTitle className={cardTitleClassName}>
            What would you like help with?
          </CardTitle>
          <CardDescription className={cardDescriptionClassName}>
            Select anything that fits. More specific questions appear only when
            they are useful.
          </CardDescription>
        </CardHeader>
        <CardContent className={cardContentClassName}>
          <FormCheckboxGroup
            control={form.control}
            name='assistanceTypes'
            label='Areas where support would help'
            options={assistanceTypeOptions}
            columns={2}
            showBadges={false}
            required
          />
          {showOtherDetails ? (
            <FormInput
              control={form.control}
              name='assistanceOther'
              label='What kind of help do you need?'
              placeholder='Something else you need help with'
              enterKeyHint='next'
              required
            />
          ) : null}
          <FormRadioGroup
            control={form.control}
            name='urgencyLevel'
            label='How urgent does this feel?'
            options={urgencyLevelOptions}
          />
        </CardContent>
      </Card>

      {showHelpfulDetails ? (
        <Card className={cardClassName}>
          <CardHeader className={cardHeaderClassName}>
            <p className={sectionKickerClassName}>Helpful details</p>
            <CardTitle className={cardTitleClassName}>
              A little context helps us respond well.
            </CardTitle>
            <CardDescription className={cardDescriptionClassName}>
              These are optional. Share only what makes the first follow-up
              easier.
            </CardDescription>
          </CardHeader>
          <CardContent className={cardContentClassName}>
            <FormTextarea
              control={form.control}
              name='situationDescription'
              label='What would be helpful to know?'
              placeholder='One sentence is enough.'
              config={{ rows: 4, maxLength: 1000, showCharCount: true }}
            />

            {showWorkDetails ? (
              <FormTextarea
                control={form.control}
                name='followUpPlans'
                label='What work or career help would feel useful?'
                placeholder='Resume review, job leads, interview practice, career direction, networking, etc.'
                config={{ rows: 3, showCharCount: false }}
              />
            ) : null}

            {showPracticalDetails ? (
              <div className={fieldGridClassName}>
                <FormInput
                  control={form.control}
                  name='requestedAmount'
                  label='Amount or practical need'
                  placeholder='$250, rent help, budget review, housing lead, etc.'
                  inputMode='decimal'
                  enterKeyHint='next'
                />
                <FormInput
                  control={form.control}
                  name='billDueDates'
                  label='Deadline, if any'
                  placeholder='Due Friday, this month, no deadline, etc.'
                  enterKeyHint='next'
                />
              </div>
            ) : null}

            {showSupportDetails ? (
              <FormTextarea
                control={form.control}
                name='safetyConcerns'
                label='What kind of support would feel comfortable?'
                placeholder='A text first, resources only, someone to sit with at church, a leader referral, etc.'
                config={{ rows: 3, showCharCount: false }}
              />
            ) : null}

            {showUrgentDetails ? (
              <FormTextarea
                control={form.control}
                name='urgentDeadlines'
                label='Is there an immediate deadline or concern?'
                placeholder='Share anything time-sensitive so the committee knows how quickly to respond.'
                config={{ rows: 3, showCharCount: false }}
              />
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card className={cardClassName}>
        <CardHeader className={cardHeaderClassName}>
          <p className={sectionKickerClassName}>Follow-up</p>
          <CardTitle className={cardTitleClassName}>
            How should we reach you?
          </CardTitle>
          <CardDescription className={cardDescriptionClassName}>
            Your name is optional. Contact info helps us actually follow up.
          </CardDescription>
        </CardHeader>
        <CardContent className={cardContentClassName}>
          <div className={fieldGridClassName}>
            <FormInput
              control={form.control}
              name='fullName'
              label='Name'
              placeholder='Optional'
              autoComplete='name'
              enterKeyHint='next'
            />
            <FormRadioGroup
              control={form.control}
              name='preferredContactMethod'
              label='Preferred follow-up'
              options={contactMethodOptions}
            />
          </div>

          <div className={fieldGridClassName}>
            {showPhone ? (
              <FormInput
                control={form.control}
                name='phone'
                label='Phone'
                type='tel'
                placeholder='Your phone number'
                autoComplete='tel'
                inputMode='tel'
                enterKeyHint='next'
                required={
                  preferredContactMethod === 'text' ||
                  preferredContactMethod === 'phone'
                }
              />
            ) : null}
            {showEmail ? (
              <FormInput
                control={form.control}
                name='email'
                label='Email'
                type='email'
                placeholder='Your email address'
                autoComplete='email'
                inputMode='email'
                enterKeyHint='next'
                required={preferredContactMethod === 'email'}
              />
            ) : null}
          </div>

          <FormInput
            control={form.control}
            name='bestContactTimes'
            label='Best time to reach you'
            placeholder='Optional: evenings, Sunday, Instagram handle, etc.'
            enterKeyHint='next'
          />

          <FormField
            control={form.control}
            name='privacyAcknowledgement'
            render={({ field }) => (
              <FormItem className='flex min-h-14 flex-row items-start gap-3 rounded-xl border p-4'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='flex flex-col gap-1 leading-none'>
                  <FormLabel>
                    I understand this will be shared with appropriate committee
                    members or leaders so someone can follow up.
                  </FormLabel>
                  <FormDescription>
                    If this is an emergency, please contact emergency services
                    or a bishopric member directly.
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <div className='hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center sm:justify-end'>
        <p className='text-muted-foreground text-sm sm:mr-auto'>
          We only ask for details that help someone follow up.
        </p>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Ask For Help'}
        </Button>
      </div>

      <div className='bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t p-3 shadow-lg backdrop-blur sm:hidden'>
        <Button type='submit' disabled={isSubmitting} className='h-11 w-full'>
          {isSubmitting ? 'Submitting...' : 'Ask For Help'}
        </Button>
      </div>
    </Form>
  );
}

export { IntakeForm };
