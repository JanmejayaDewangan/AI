import { serverSupabase } from './server-supabase';
import { getRecoveryConfig, type RecoveryConfig } from './recovery-config';
import { analyzePaymentFailure, type AIAnalysis } from './ai-service';
import { sendWhatsApp } from './whatsapp-service';
import { sendEmail } from './email-service';
import { createRazorpayPaymentLink } from './razorpay';

export type DecisionResult = {
  action: string;
  analysis: AIAnalysis;
  provider: string;
  aiError?: string;
  policyNote: string;
  nextActionAt: Date | null;
};

export async function getPaymentHistory(customerId: string): Promise<{
  successfulPayments: number;
  failedPayments: number;
  previousRecoveryAttempts: number;
}> {
  const { data: payments } = await serverSupabase
    .from('payments')
    .select('status')
    .eq('customer_id', customerId);
  const successfulPayments = payments?.filter((p) => p.status === 'captured' || p.status === 'authorized').length ?? 0;
  const failedPayments = payments?.filter((p) => p.status === 'failed').length ?? 0;

  const { data: cases } = await serverSupabase
    .from('recovery_cases')
    .select('retry_count')
    .eq('customer_id', customerId);
  const previousRecoveryAttempts = cases?.reduce((sum, c) => sum + (c.retry_count ?? 0), 0) ?? 0;

  return { successfulPayments, failedPayments, previousRecoveryAttempts };
}

export async function runDecisionEngine(params: {
  paymentId: string;
  customerId: string;
  amount: number;
  failureCode: string | null;
  failureDescription: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
}): Promise<DecisionResult> {
  const config = await getRecoveryConfig();
  const history = await getPaymentHistory(params.customerId);

  const { analysis, provider, error: aiError } = await analyzePaymentFailure({
    failureCode: params.failureCode,
    failureDescription: params.failureDescription,
    amount: params.amount,
    paymentHistory: history,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
  });

  const action = applyPolicyRules(analysis, config, {
    amount: params.amount,
    retryCount: history.previousRecoveryAttempts,
    customerOptedOut: false,
  });

  const nextActionAt = computeNextActionAt(action, config);

  return {
    action,
    analysis,
    provider,
    aiError,
    policyNote: getPolicyNote(action, analysis, config, params.amount),
    nextActionAt,
  };
}

type PolicyContext = {
  amount: number;
  retryCount: number;
  customerOptedOut: boolean;
};

function applyPolicyRules(
  analysis: AIAnalysis,
  config: RecoveryConfig,
  ctx: PolicyContext,
): string {
  if (ctx.customerOptedOut) return 'escalate';

  if (ctx.retryCount >= config.ESCALATION_THRESHOLD) {
    return 'escalate';
  }

  if (analysis.confidence * 100 < config.AI_CONFIDENCE_THRESHOLD) {
    return 'escalate';
  }

  if (analysis.recommended_action === 'retry_payment') {
    if (ctx.amount > config.MAX_AMOUNT_AUTO_RETRY) {
      return 'whatsapp';
    }
    if (ctx.retryCount >= config.MAX_RETRY_ATTEMPTS) {
      return 'escalate';
    }
    return 'retry_payment';
  }

  if (analysis.recommended_action === 'whatsapp') {
    return 'whatsapp';
  }

  if (analysis.recommended_action === 'email') {
    return 'email';
  }

  if (analysis.recommended_action === 'escalate') {
    return 'escalate';
  }

  return 'email';
}

function computeNextActionAt(action: string, config: RecoveryConfig): Date | null {
  if (action === 'escalate') return null;
  const now = new Date();
  if (action === 'retry_payment') {
    return new Date(now.getTime() + config.RETRY_DELAY_MINUTES * 60 * 1000);
  }
  return new Date(now.getTime() + config.FOLLOWUP_DELAY_HOURS * 60 * 60 * 1000);
}

function getPolicyNote(action: string, analysis: AIAnalysis, config: RecoveryConfig, amount: number): string {
  if (action !== analysis.recommended_action) {
    if (amount > config.MAX_AMOUNT_AUTO_RETRY && analysis.recommended_action === 'retry_payment') {
      return `AI recommended retry, but amount exceeds auto-retry limit of ₹${config.MAX_AMOUNT_AUTO_RETRY}. Switched to WhatsApp notification.`;
    }
    return `AI recommended ${analysis.recommended_action} but policy rules overrode to ${action}.`;
  }
  return `AI recommendation approved by policy engine.`;
}

export async function executeAction(params: {
  caseId: string;
  action: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  amount: number;
  orderId?: string | null;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { caseId, action } = params;

  if (action === 'whatsapp') {
    if (!params.customerPhone) {
      await logAction(caseId, 'whatsapp', 'failed', null, 'Customer phone not available');
      return { success: false, error: 'Customer phone not available' };
    }
    const message = `Hi ${params.customerName}, your payment of ₹${params.amount} failed. Please update your payment method to continue your subscription. Reply HELP for assistance.`;
    const result = await sendWhatsApp(params.customerPhone, message);
    await logAction(caseId, 'whatsapp', result.success ? 'sent' : 'failed', result.messageId, result.error);
    return result;
  }

  if (action === 'email') {
    if (!params.customerEmail) {
      await logAction(caseId, 'email', 'failed', null, 'Customer email not available');
      return { success: false, error: 'Customer email not available' };
    }
    const subject = 'Action needed: Payment recovery';
    const html = `<p>Hi ${params.customerName},</p><p>Your payment of ₹${params.amount} could not be processed. Please update your payment method to avoid service interruption.</p><p>Thank you.</p>`;
    const result = await sendEmail(params.customerEmail, subject, html);
    await logAction(caseId, 'email', result.success ? 'sent' : 'failed', result.messageId, result.error);
    return result;
  }

  if (action === 'retry_payment') {
    const link = await createRazorpayPaymentLink(
      params.orderId ?? `recovery_${caseId}`,
      params.amount,
      `Payment recovery for ${params.customerName}`,
      params.customerName,
      params.customerEmail ?? '',
      params.customerPhone ?? '',
    );
    if (link.short_url) {
      await logAction(caseId, 'retry_payment', 'sent', null, null, `Payment link: ${link.short_url}`);
      return { success: true };
    }
    await logAction(caseId, 'retry_payment', 'failed', null, link.error);
    return { success: false, error: link.error };
  }

  if (action === 'escalate') {
    await logAction(caseId, 'escalate', 'completed', null, null, 'Case escalated to human review');
    return { success: true };
  }

  return { success: false, error: `Unknown action: ${action}` };
}

async function logAction(
  caseId: string,
  actionType: string,
  status: string,
  messageId: string | null,
  error: string | null,
  message?: string,
) {
  await serverSupabase.from('recovery_actions').insert({
    recovery_case_id: caseId,
    action_type: actionType,
    channel: actionType,
    status,
    provider_message_id: messageId,
    error_message: error,
    message: message ?? null,
    completed_at: status !== 'pending' ? new Date().toISOString() : null,
  });
}
