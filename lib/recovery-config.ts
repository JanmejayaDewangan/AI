import { serverSupabase } from './server-supabase';

export type RecoveryConfig = {
  MAX_RETRY_ATTEMPTS: number;
  RETRY_DELAY_MINUTES: number;
  ESCALATION_THRESHOLD: number;
  FOLLOWUP_DELAY_HOURS: number;
  MAX_AMOUNT_AUTO_RETRY: number;
  AI_CONFIDENCE_THRESHOLD: number;
};

const DEFAULTS: RecoveryConfig = {
  MAX_RETRY_ATTEMPTS: 2,
  RETRY_DELAY_MINUTES: 360,
  ESCALATION_THRESHOLD: 3,
  FOLLOWUP_DELAY_HOURS: 24,
  MAX_AMOUNT_AUTO_RETRY: 50000,
  AI_CONFIDENCE_THRESHOLD: 70,
};

export async function getRecoveryConfig(): Promise<RecoveryConfig> {
  const { data } = await serverSupabase.from('recovery_config').select('key, value');
  if (!data) return DEFAULTS;
  const map: Record<string, string> = {};
  for (const row of data) map[row.key] = row.value;
  return {
    MAX_RETRY_ATTEMPTS: parseInt(map.MAX_RETRY_ATTEMPTS ?? String(DEFAULTS.MAX_RETRY_ATTEMPTS)),
    RETRY_DELAY_MINUTES: parseInt(map.RETRY_DELAY_MINUTES ?? String(DEFAULTS.RETRY_DELAY_MINUTES)),
    ESCALATION_THRESHOLD: parseInt(map.ESCALATION_THRESHOLD ?? String(DEFAULTS.ESCALATION_THRESHOLD)),
    FOLLOWUP_DELAY_HOURS: parseInt(map.FOLLOWUP_DELAY_HOURS ?? String(DEFAULTS.FOLLOWUP_DELAY_HOURS)),
    MAX_AMOUNT_AUTO_RETRY: parseInt(map.MAX_AMOUNT_AUTO_RETRY ?? String(DEFAULTS.MAX_AMOUNT_AUTO_RETRY)),
    AI_CONFIDENCE_THRESHOLD: parseInt(map.AI_CONFIDENCE_THRESHOLD ?? String(DEFAULTS.AI_CONFIDENCE_THRESHOLD)),
  };
}
