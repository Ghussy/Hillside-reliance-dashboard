import type { CasePriority, CaseRecord, CaseStatus } from './types';

export const caseStatusOptions: { value: CaseStatus; label: string }[] = [
  { value: 'new', label: 'New Intake' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'initial_contact_made', label: 'Initial Contact Made' },
  { value: 'active_support', label: 'Active Support' },
  { value: 'waiting_on_member', label: 'Waiting On Member' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'inactive', label: 'Inactive' }
];

export const casePriorityOptions: { value: CasePriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

export function getStatusLabel(status: string): string {
  return (
    caseStatusOptions.find((option) => option.value === status)?.label ?? status
  );
}

export function getPriorityLabel(priority: string): string {
  return (
    casePriorityOptions.find((option) => option.value === priority)?.label ??
    priority
  );
}

export function formatCaseDate(value: string | null): string {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}

export function createFirstContactDraft(caseRecord: CaseRecord): string {
  const name = caseRecord.intake?.full_name;
  const firstName =
    name && name !== 'Anonymous' ? ` ${name.split(' ')[0]}` : '';
  const category = caseRecord.category
    ? caseRecord.category.replaceAll('_', ' ')
    : 'what you shared';

  return `Hi${firstName}, thanks for reaching out. I’m glad you submitted the form. I’d love to help with ${category}. Would you be open to a quick 10-minute conversation this week so I can understand what would be most helpful?`;
}

export function buildSmsHref(phone: string, message: string): string {
  return `sms:${encodeURIComponent(phone)}&body=${encodeURIComponent(message)}`;
}

export function buildMailtoHref(email: string, message: string): string {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    'Following up from the ward self-reliance committee'
  )}&body=${encodeURIComponent(message)}`;
}
