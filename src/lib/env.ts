/**
 * Supabase public env (required for auth).
 * Set in `.env.local` or `.env` — see `env.example.txt`.
 */
export const SUPABASE_ENV = {
  url: 'NEXT_PUBLIC_SUPABASE_URL',
  publishableKey: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  serviceRoleKey: 'SUPABASE_SERVICE_ROLE_KEY'
} as const;

export const AI_ENV = {
  openAiApiKey: 'OPEN_AI_API_KEY',
  openAiApiKeyFallback: 'OPENAI_API_KEY',
  model: 'AI_MODEL'
} as const;

export const GOOGLE_SHEETS_ENV = {
  webhookUrl: 'GOOGLE_SHEETS_INTAKE_WEBHOOK_URL',
  webhookSecret: 'GOOGLE_SHEETS_INTAKE_WEBHOOK_SECRET'
} as const;

export const hasSupabaseEnv: boolean =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export const hasGoogleSheetsEnv: boolean =
  Boolean(process.env.GOOGLE_SHEETS_INTAKE_WEBHOOK_URL) &&
  Boolean(process.env.GOOGLE_SHEETS_INTAKE_WEBHOOK_SECRET);

export function getSupabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      `Supabase env missing. Set ${SUPABASE_ENV.url} and ${SUPABASE_ENV.publishableKey} in .env or .env.local (copy from env.example.txt).`
    );
  }

  return { url, key };
}

export function getSupabaseAdminEnv(): { url: string; serviceRoleKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      `Supabase admin env missing. Set ${SUPABASE_ENV.url} and ${SUPABASE_ENV.serviceRoleKey} in .env or .env.local.`
    );
  }

  return { url, serviceRoleKey };
}

export function getGoogleSheetsEnv(): {
  webhookUrl: string;
  webhookSecret: string;
} {
  const webhookUrl = process.env.GOOGLE_SHEETS_INTAKE_WEBHOOK_URL;
  const webhookSecret = process.env.GOOGLE_SHEETS_INTAKE_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    throw new Error(
      `Google Sheets env missing. Set ${GOOGLE_SHEETS_ENV.webhookUrl} and ${GOOGLE_SHEETS_ENV.webhookSecret} in .env or .env.local.`
    );
  }

  return { webhookUrl, webhookSecret };
}

export function getAiEnv(): { apiKey: string; model: string } {
  const apiKey =
    process.env.OPEN_AI_API_KEY ?? process.env.OPENAI_API_KEY ?? '';

  if (!apiKey) {
    throw new Error(
      `AI env missing. Set ${AI_ENV.openAiApiKey} or ${AI_ENV.openAiApiKeyFallback} in .env or .env.local.`
    );
  }

  return {
    apiKey,
    model: process.env.AI_MODEL ?? 'gpt-5.5'
  };
}
