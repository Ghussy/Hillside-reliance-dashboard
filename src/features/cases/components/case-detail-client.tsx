'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { CaseAssignee, CaseRecord } from '@/features/cases/types';
import {
  buildMailtoHref,
  buildSmsHref,
  casePriorityOptions,
  caseStatusOptions,
  createFirstContactDraft,
  formatCaseDate,
  getPriorityLabel,
  getStatusLabel
} from '@/features/cases/utils';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

function toDateTimeLocal(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

function assistanceLabel(value: string): string {
  return value.replaceAll('_', ' ');
}

function IntakeSummary({ caseRecord }: { caseRecord: CaseRecord }) {
  const intake = caseRecord.intake;

  if (!intake) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Intake Summary</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4 text-sm'>
        <div className='flex flex-wrap gap-2'>
          {intake.assistance_types.map((type) => (
            <Badge key={type} variant='secondary'>
              {assistanceLabel(type)}
            </Badge>
          ))}
        </div>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          <div>
            <p className='text-muted-foreground'>Name</p>
            <p>{intake.full_name}</p>
          </div>
          <div>
            <p className='text-muted-foreground'>Preferred contact</p>
            <p>{intake.preferred_contact_method}</p>
          </div>
          <div>
            <p className='text-muted-foreground'>Phone</p>
            <p>{intake.phone ?? 'Not provided'}</p>
          </div>
          <div>
            <p className='text-muted-foreground'>Email</p>
            <p>{intake.email ?? 'Not provided'}</p>
          </div>
        </div>
        <div>
          <p className='text-muted-foreground'>Situation</p>
          <p className='leading-relaxed'>{intake.situation_description}</p>
        </div>
        {intake.follow_up_plans ? (
          <div>
            <p className='text-muted-foreground'>Requested next step</p>
            <p className='leading-relaxed'>{intake.follow_up_plans}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function FirstContactCard({ caseRecord }: { caseRecord: CaseRecord }) {
  const router = useRouter();
  const [draft, setDraft] = useState(
    caseRecord.ai_first_contact_draft ?? createFirstContactDraft(caseRecord)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const intake = caseRecord.intake;
  const phone = intake?.phone;
  const email = intake?.email;

  async function markContactMade() {
    const response = await fetch(`/api/cases/${caseRecord.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'initial_contact_made',
        lastContactAt: new Date().toISOString(),
        aiFirstContactDraft: draft
      })
    });

    if (!response.ok) {
      toast.error('Could not mark contact as made.');
      return;
    }

    await fetch(`/api/cases/${caseRecord.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body: `Initial contact draft used:\n\n${draft}`,
        noteType: 'contact'
      })
    });

    toast.success('Initial contact marked.');
    router.refresh();
  }

  async function generateAiDraft() {
    setIsGenerating(true);
    const response = await fetch(
      `/api/cases/${caseRecord.id}/ai/first-contact`,
      { method: 'POST' }
    );
    setIsGenerating(false);

    if (!response.ok) {
      toast.error('Could not generate a draft.');
      return;
    }

    const data = (await response.json()) as { message?: string };
    if (data.message) {
      setDraft(data.message);
      toast.success('Draft generated.');
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>First Contact</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='first-contact-draft'>Editable draft</Label>
          <Textarea
            id='first-contact-draft'
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={5}
          />
        </div>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button
            type='button'
            variant='outline'
            onClick={generateAiDraft}
            disabled={isGenerating}
          >
            {isGenerating ? 'Drafting...' : 'Draft With AI'}
          </Button>
          {phone ? (
            <Button asChild>
              <a href={buildSmsHref(phone, draft)}>Open Messages</a>
            </Button>
          ) : null}
          {email ? (
            <Button asChild variant='outline'>
              <a href={buildMailtoHref(email, draft)}>Open Email</a>
            </Button>
          ) : null}
          <Button type='button' variant='secondary' onClick={markContactMade}>
            Mark Contact Made
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function CaseDetailClient({
  caseRecord,
  members
}: {
  caseRecord: CaseRecord;
  members: CaseAssignee[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(caseRecord.status);
  const [priority, setPriority] = useState(caseRecord.priority);
  const [assignedToMemberId, setAssignedToMemberId] = useState(
    caseRecord.assigned_to_member_id ?? 'unassigned'
  );
  const [nextStep, setNextStep] = useState(caseRecord.next_step ?? '');
  const [followUpAt, setFollowUpAt] = useState(
    toDateTimeLocal(caseRecord.follow_up_at)
  );
  const [noteBody, setNoteBody] = useState('');
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDueAt, setReminderDueAt] = useState('');
  const [isTriaging, setIsTriaging] = useState(false);
  const [isCleaningNote, setIsCleaningNote] = useState(false);
  const [isSuggestingFollowUp, setIsSuggestingFollowUp] = useState(false);

  const openReminders = useMemo(
    () =>
      (caseRecord.reminders ?? []).filter(
        (reminder) => reminder.status !== 'done'
      ),
    [caseRecord.reminders]
  );

  async function saveCase() {
    const response = await fetch(`/api/cases/${caseRecord.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        priority,
        assignedToMemberId:
          assignedToMemberId === 'unassigned' ? null : assignedToMemberId,
        nextStep,
        followUpAt: fromDateTimeLocal(followUpAt)
      })
    });

    if (!response.ok) {
      toast.error('Could not save case.');
      return;
    }

    toast.success('Case saved.');
    router.refresh();
  }

  async function runAiTriage() {
    setIsTriaging(true);
    const response = await fetch(`/api/cases/${caseRecord.id}/ai/triage`, {
      method: 'POST'
    });
    setIsTriaging(false);

    if (!response.ok) {
      toast.error('Could not triage case.');
      return;
    }

    toast.success('AI triage saved.');
    router.refresh();
  }

  async function addNote() {
    if (!noteBody.trim()) return;

    const response = await fetch(`/api/cases/${caseRecord.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: noteBody, noteType: 'general' })
    });

    if (!response.ok) {
      toast.error('Could not add note.');
      return;
    }

    setNoteBody('');
    toast.success('Note added.');
    router.refresh();
  }

  async function cleanNoteWithAi() {
    if (!noteBody.trim()) return;

    setIsCleaningNote(true);
    const response = await fetch(`/api/cases/${caseRecord.id}/ai/clean-note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: noteBody })
    });
    setIsCleaningNote(false);

    if (!response.ok) {
      toast.error('Could not clean note.');
      return;
    }

    const data = (await response.json()) as { cleanNote?: string };
    if (data.cleanNote) {
      setNoteBody(data.cleanNote);
      toast.success('Note cleaned. Review before saving.');
    }
  }

  async function addReminder() {
    if (!reminderTitle.trim() || !reminderDueAt) return;

    const response = await fetch(`/api/cases/${caseRecord.id}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: reminderTitle,
        dueAt: fromDateTimeLocal(reminderDueAt),
        assignedToMemberId:
          assignedToMemberId === 'unassigned' ? null : assignedToMemberId
      })
    });

    if (!response.ok) {
      toast.error('Could not add reminder.');
      return;
    }

    setReminderTitle('');
    setReminderDueAt('');
    toast.success('Reminder added.');
    router.refresh();
  }

  async function completeReminder(reminderId: string) {
    const response = await fetch(`/api/cases/reminders/${reminderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' })
    });

    if (!response.ok) {
      toast.error('Could not complete reminder.');
      return;
    }

    toast.success('Reminder completed.');
    router.refresh();
  }

  async function suggestFollowUpWithAi() {
    setIsSuggestingFollowUp(true);
    const response = await fetch(`/api/cases/${caseRecord.id}/ai/follow-up`, {
      method: 'POST'
    });
    setIsSuggestingFollowUp(false);

    if (!response.ok) {
      toast.error('Could not suggest follow-up.');
      return;
    }

    const data = (await response.json()) as {
      suggestedNextStep?: string;
      suggestedMessage?: string;
    };
    setNextStep(data.suggestedNextStep ?? data.suggestedMessage ?? nextStep);
    toast.success('Follow-up suggestion ready. Review before saving.');
    router.refresh();
  }

  return (
    <div className='grid grid-cols-1 gap-4 xl:grid-cols-[1fr_420px]'>
      <div className='flex flex-col gap-4'>
        <IntakeSummary caseRecord={caseRecord} />
        <FirstContactCard caseRecord={caseRecord} />
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='case-note'>Add a note</Label>
              <Textarea
                id='case-note'
                value={noteBody}
                onChange={(event) => setNoteBody(event.target.value)}
                placeholder='Current situation, agreed next step, owner, unresolved needs...'
                rows={4}
              />
              <Button type='button' onClick={addNote}>
                Add Note
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={cleanNoteWithAi}
                disabled={isCleaningNote || !noteBody.trim()}
              >
                {isCleaningNote ? 'Cleaning...' : 'Clean Note With AI'}
              </Button>
            </div>
            <div className='flex flex-col gap-3'>
              {(caseRecord.notes ?? []).map((note) => (
                <div key={note.id} className='rounded-lg border p-3 text-sm'>
                  <p className='leading-relaxed whitespace-pre-wrap'>
                    {note.body}
                  </p>
                  <p className='text-muted-foreground mt-2 text-xs'>
                    {note.author?.name ?? 'Unknown'} ·{' '}
                    {formatCaseDate(note.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='flex flex-col gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>Case Controls</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='grid gap-2'>
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as typeof status)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {caseStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as typeof priority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {casePriorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label>Owner</Label>
              <Select
                value={assignedToMemberId}
                onValueChange={setAssignedToMemberId}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='unassigned'>Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='next-step'>Next step</Label>
              <Textarea
                id='next-step'
                value={nextStep}
                onChange={(event) => setNextStep(event.target.value)}
                rows={3}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='follow-up-at'>Follow-up date</Label>
              <Input
                id='follow-up-at'
                type='datetime-local'
                value={followUpAt}
                onChange={(event) => setFollowUpAt(event.target.value)}
              />
            </div>
            <Button type='button' onClick={saveCase}>
              Save Case
            </Button>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              <Button
                type='button'
                variant='outline'
                onClick={runAiTriage}
                disabled={isTriaging}
              >
                {isTriaging ? 'Triaging...' : 'AI Triage'}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={suggestFollowUpWithAi}
                disabled={isSuggestingFollowUp}
              >
                {isSuggestingFollowUp ? 'Suggesting...' : 'Suggest Follow-Up'}
              </Button>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline'>
                {getStatusLabel(caseRecord.status)}
              </Badge>
              <Badge variant='outline'>
                {getPriorityLabel(caseRecord.priority)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {Object.keys(caseRecord.ai_triage ?? {}).length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>AI Triage Draft</CardTitle>
            </CardHeader>
            <CardContent className='text-sm'>
              <pre className='bg-muted rounded-lg p-3 text-xs leading-relaxed whitespace-pre-wrap'>
                {JSON.stringify(caseRecord.ai_triage, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Reminders</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='reminder-title'>New reminder</Label>
              <Input
                id='reminder-title'
                value={reminderTitle}
                onChange={(event) => setReminderTitle(event.target.value)}
                placeholder='Follow up about resume draft'
              />
              <Input
                type='datetime-local'
                value={reminderDueAt}
                onChange={(event) => setReminderDueAt(event.target.value)}
              />
              <Button type='button' onClick={addReminder}>
                Add Reminder
              </Button>
            </div>
            <div className='flex flex-col gap-3'>
              {openReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className='flex items-start justify-between gap-3 rounded-lg border p-3 text-sm'
                >
                  <div>
                    <p className='font-medium'>{reminder.title}</p>
                    <p className='text-muted-foreground text-xs'>
                      Due {formatCaseDate(reminder.due_at)}
                    </p>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => completeReminder(reminder.id)}
                  >
                    Done
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
