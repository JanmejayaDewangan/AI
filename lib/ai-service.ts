export type AIAnalysis = {
  reason_category: string;
  confidence: number;
  recommended_action: string;
  priority: string;
  explanation: string;
};

export type AIInput = {
  failureCode: string | null;
  failureDescription: string | null;
  amount: number;
  paymentHistory: {
    successfulPayments: number;
    failedPayments: number;
    previousRecoveryAttempts: number;
  };
  customerName: string;
  customerEmail: string | null;
};

const VALID_CATEGORIES = [
  'insufficient_funds', 'card_declined', 'authentication_failure',
  'expired_card', 'bank_error', 'network_error', 'customer_abandoned', 'unknown',
];

const VALID_ACTIONS = ['retry_payment', 'whatsapp', 'email', 'escalate'];

const VALID_PRIORITIES = ['low', 'medium', 'high'];

function validateAIResponse(raw: Record<string, unknown>): AIAnalysis | null {
  if (typeof raw.reason_category !== 'string' || !VALID_CATEGORIES.includes(raw.reason_category)) return null;
  if (typeof raw.confidence !== 'number' || raw.confidence < 0 || raw.confidence > 1) return null;
  if (typeof raw.recommended_action !== 'string' || !VALID_ACTIONS.includes(raw.recommended_action)) return null;
  if (typeof raw.priority !== 'string' || !VALID_PRIORITIES.includes(raw.priority)) return null;
  if (typeof raw.explanation !== 'string') return null;
  return {
    reason_category: raw.reason_category,
    confidence: raw.confidence,
    recommended_action: raw.recommended_action,
    priority: raw.priority,
    explanation: raw.explanation,
  };
}

function fallbackAnalysis(input: AIInput): AIAnalysis {
  const code = (input.failureCode ?? '').toUpperCase();
  const desc = (input.failureDescription ?? '').toLowerCase();
  let category = 'unknown';
  let action = 'email';
  let confidence = 0.5;

  if (code.includes('INSUFFICIENT') || desc.includes('insufficient')) {
    category = 'insufficient_funds';
    action = 'retry_payment';
    confidence = 0.7;
  } else if (code.includes('EXPIRED') || desc.includes('expired')) {
    category = 'expired_card';
    action = 'whatsapp';
    confidence = 0.75;
  } else if (code.includes('DECLINED') || desc.includes('declined')) {
    category = 'card_declined';
    action = 'whatsapp';
    confidence = 0.6;
  } else if (code.includes('AUTH') || desc.includes('authentication')) {
    category = 'authentication_failure';
    action = 'whatsapp';
    confidence = 0.55;
  } else if (desc.includes('network') || desc.includes('timeout')) {
    category = 'network_error';
    action = 'retry_payment';
    confidence = 0.8;
  } else if (desc.includes('abandoned') || desc.includes('cancel')) {
    category = 'customer_abandoned';
    action = 'email';
    confidence = 0.5;
  }

  if (input.paymentHistory.previousRecoveryAttempts >= 3) {
    action = 'escalate';
    confidence = 0.4;
  }

  const priority = input.amount > 50000 ? 'high' : input.amount > 10000 ? 'medium' : 'low';

  return {
    reason_category: category,
    confidence,
    recommended_action: action,
    priority,
    explanation: `Fallback analysis: payment failure classified as ${category}. Recommended action: ${action}.`,
  };
}

export async function analyzePaymentFailure(input: AIInput): Promise<{ analysis: AIAnalysis; provider: string; error?: string }> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a payment recovery AI analyst. Analyze payment failures and return ONLY valid JSON with fields: reason_category, confidence (0-1), recommended_action, priority, explanation. reason_category must be one of: insufficient_funds, card_declined, authentication_failure, expired_card, bank_error, network_error, customer_abandoned, unknown. recommended_action must be one of: retry_payment, whatsapp, email, escalate. priority must be one of: low, medium, high.',
            },
            {
              role: 'user',
              content: JSON.stringify(input),
            },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        const validated = validateAIResponse(parsed);
        if (validated) return { analysis: validated, provider: 'openai' };
      }
    } catch {
      // fall through to gemini/fallback
    }
  }

  if (geminiKey) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a payment recovery AI analyst. Analyze this payment failure and return ONLY valid JSON (no markdown) with fields: reason_category, confidence (0-1), recommended_action, priority, explanation. reason_category must be one of: insufficient_funds, card_declined, authentication_failure, expired_card, bank_error, network_error, customer_abandoned, unknown. recommended_action must be one of: retry_payment, whatsapp, email, escalate. priority must be one of: low, medium, high.\n\n${JSON.stringify(input)}`,
            }],
          }],
          generationConfig: { temperature: 0.3 },
        }),
      });
      const data = await res.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) {
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        const validated = validateAIResponse(parsed);
        if (validated) return { analysis: validated, provider: 'gemini' };
      }
    } catch {
      // fall through to fallback
    }
  }

  return { analysis: fallbackAnalysis(input), provider: 'fallback', error: 'AI provider not configured or returned invalid response — using deterministic fallback' };
}
