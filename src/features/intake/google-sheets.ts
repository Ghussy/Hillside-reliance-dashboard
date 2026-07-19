import { getGoogleSheetsEnv } from '@/lib/env';
import {
  assistanceTypeOptions,
  contactMethodOptions,
  needDurationOptions,
  supportSourceOptions,
  urgencyFlagOptions,
  urgencyLevelOptions,
  type IntakeSubmission
} from '@/features/intake/schema';

interface GoogleSheetsWebhookResponse {
  ok?: boolean;
  error?: string;
}

interface IntakeOption {
  value: string;
  label: string;
}

function optionLabel(options: IntakeOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

function optionLabels(options: IntakeOption[], values: string[]): string[] {
  return values.map((value) => optionLabel(options, value));
}

export async function appendIntakeToGoogleSheet(
  values: IntakeSubmission
): Promise<void> {
  const { webhookUrl, webhookSecret } = getGoogleSheetsEnv();
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      secret: webhookSecret,
      submission: {
        submissionId: crypto.randomUUID(),
        submittedAt: new Date().toISOString(),
        ...values,
        preferredContactMethod: optionLabel(
          contactMethodOptions,
          values.preferredContactMethod
        ),
        assistanceTypes: optionLabels(
          assistanceTypeOptions,
          values.assistanceTypes
        ),
        needDuration: optionLabel(needDurationOptions, values.needDuration),
        urgencyLevel: optionLabel(urgencyLevelOptions, values.urgencyLevel),
        urgencyFlags: optionLabels(urgencyFlagOptions, values.urgencyFlags),
        supportSources: optionLabels(
          supportSourceOptions,
          values.supportSources
        ),
        sharePermission: values.sharePermission ? 'Yes' : 'No',
        privacyAcknowledgement: values.privacyAcknowledgement ? 'Yes' : 'No'
      }
    }),
    cache: 'no-store',
    redirect: 'follow',
    signal: AbortSignal.timeout(10_000)
  });

  if (!response.ok) {
    throw new Error(`Google Sheets webhook returned ${response.status}.`);
  }

  const result = (await response.json()) as GoogleSheetsWebhookResponse;

  if (!result.ok) {
    throw new Error(result.error ?? 'Google Sheets webhook rejected the row.');
  }
}
