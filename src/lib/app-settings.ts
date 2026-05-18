import {
  AI_MODEL_OPTIONS,
  isSupportedAiModel
} from '@/features/settings/ai-models';
import { getAiEnv } from '@/lib/env';
import { createAdminClient } from '@/supabase/admin';
import { createClient } from '@/supabase/server';

export const AI_MODEL_SETTING_KEY = 'ai_model';

function normalizeAiModel(value: unknown): string | null {
  if (typeof value === 'string' && isSupportedAiModel(value)) {
    return value;
  }

  return null;
}

export async function getAiModelSetting(): Promise<string> {
  const fallback = getAiEnv().model;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', AI_MODEL_SETTING_KEY)
      .single();

    return normalizeAiModel(data?.value) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getAiModelSettingForDashboard(): Promise<string> {
  const fallback = getAiEnv().model;
  const supabase = await createClient();
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', AI_MODEL_SETTING_KEY)
    .single();

  return normalizeAiModel(data?.value) ?? fallback;
}

export function getDefaultAiModel(): string {
  const fallback = getAiEnv().model;
  return isSupportedAiModel(fallback) ? fallback : AI_MODEL_OPTIONS[0].value;
}
