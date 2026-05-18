export const AI_MODEL_OPTIONS = [
  {
    value: 'gpt-5.5',
    label: 'GPT-5.5',
    description: 'Best default for case triage and message drafting.'
  },
  {
    value: 'gpt-5.5-pro',
    label: 'GPT-5.5 Pro',
    description: 'Use for highest quality when speed/cost matter less.'
  },
  {
    value: 'gpt-5.4',
    label: 'GPT-5.4',
    description: 'Strong general-purpose option.'
  },
  {
    value: 'gpt-5.4-mini',
    label: 'GPT-5.4 Mini',
    description: 'Faster and lighter for routine drafts.'
  },
  {
    value: 'gpt-5.4-nano',
    label: 'GPT-5.4 Nano',
    description: 'Lowest-cost option for simple suggestions.'
  }
] as const;

export type AiModelOption = (typeof AI_MODEL_OPTIONS)[number]['value'];

export function isSupportedAiModel(value: string): value is AiModelOption {
  return AI_MODEL_OPTIONS.some((option) => option.value === value);
}
