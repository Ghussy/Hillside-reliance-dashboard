import { getAiEnv } from '@/lib/env';
import { getAiModelSetting } from '@/lib/app-settings';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import * as z from 'zod';
import type { CaseRecord } from '../types';
import { createFirstContactDraft } from '../utils';

const triageSchema = z.object({
  summary: z.string(),
  category: z.enum([
    'employment',
    'finances',
    'housing',
    'mental_health',
    'community',
    'other'
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  riskFlags: z.array(z.string()),
  clarificationQuestions: z.array(z.string()),
  suggestedNextStep: z.string()
});

const firstContactSchema = z.object({
  message: z.string()
});

const cleanNoteSchema = z.object({
  currentSituation: z.string(),
  agreedNextStep: z.string(),
  owner: z.string(),
  followUpDate: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high', 'urgent']),
  unresolvedNeeds: z.array(z.string()),
  cleanNote: z.string()
});

const followUpSchema = z.object({
  isStale: z.boolean(),
  reason: z.string(),
  suggestedMessage: z.string(),
  suggestedNextStep: z.string()
});

async function getCaseAiModel() {
  const { apiKey } = getAiEnv();
  const model = await getAiModelSetting();
  const openai = createOpenAI({ apiKey });
  return openai(model);
}

function describeCase(caseRecord: CaseRecord): string {
  const intake = caseRecord.intake;

  return JSON.stringify(
    {
      case: {
        status: caseRecord.status,
        priority: caseRecord.priority,
        category: caseRecord.category,
        nextStep: caseRecord.next_step,
        followUpAt: caseRecord.follow_up_at,
        lastContactAt: caseRecord.last_contact_at
      },
      intake: intake
        ? {
            name: intake.full_name,
            preferredContactMethod: intake.preferred_contact_method,
            assistanceTypes: intake.assistance_types,
            otherAssistance: intake.assistance_other,
            urgencyLevel: intake.urgency_level,
            situation: intake.situation_description,
            requestedAmount: intake.requested_amount,
            deadlines: intake.bill_due_dates ?? intake.urgent_deadlines,
            safetyConcerns: intake.safety_concerns,
            requestedNextStep: intake.follow_up_plans
          }
        : null,
      notes: caseRecord.notes?.map((note) => ({
        body: note.body,
        createdAt: note.created_at,
        type: note.note_type
      })),
      reminders: caseRecord.reminders?.map((reminder) => ({
        title: reminder.title,
        dueAt: reminder.due_at,
        status: reminder.status
      }))
    },
    null,
    2
  );
}

const systemPrompt =
  'You help a church self-reliance committee manage support requests. Be warm, concise, practical, and nonjudgmental. Do not diagnose mental health conditions. If there may be immediate danger, suggest human escalation to appropriate leaders or emergency services. Treat all output as a draft for a volunteer to review.';

export async function triageCase(caseRecord: CaseRecord) {
  const result = await generateObject({
    model: await getCaseAiModel(),
    schema: triageSchema,
    system: systemPrompt,
    prompt: `Triage this intake request. Return a concise committee-facing summary, category, priority, risk flags, clarification questions, and suggested next step.\n\n${describeCase(
      caseRecord
    )}`
  });

  return result.object;
}

export async function draftFirstContact(caseRecord: CaseRecord) {
  const fallback = createFirstContactDraft(caseRecord);
  const result = await generateObject({
    model: await getCaseAiModel(),
    schema: firstContactSchema,
    system: systemPrompt,
    prompt: `Draft one short first-contact message. It should be text-message friendly, warm, and invite a small next step. Do not overpromise. If contact information is vague, still draft a general message.\n\nFallback style example:\n${fallback}\n\nCase:\n${describeCase(
      caseRecord
    )}`
  });

  return result.object;
}

export async function cleanCaseNote(rawNotes: string) {
  const result = await generateObject({
    model: await getCaseAiModel(),
    schema: cleanNoteSchema,
    system: systemPrompt,
    prompt: `Turn these rough volunteer notes into a clean case update. Preserve uncertainty and do not invent facts.\n\n${rawNotes}`
  });

  return result.object;
}

export async function suggestFollowUp(caseRecord: CaseRecord) {
  const result = await generateObject({
    model: await getCaseAiModel(),
    schema: followUpSchema,
    system: systemPrompt,
    prompt: `Review this case and suggest whether it needs follow-up. If stale, draft a short warm follow-up message and next step.\n\n${describeCase(
      caseRecord
    )}`
  });

  return result.object;
}
