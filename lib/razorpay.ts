import { createHmac } from 'crypto';

export function verifyRazorpaySignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  if (!secret) return false;
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  return expected === signature;
}

export type RazorpayPaymentPayload = {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id?: string;
  error_description?: string;
  error_code?: string;
  method?: string;
  email?: string;
  contact?: string;
  notes?: Record<string, string>;
};

export type RazorpayWebhookEvent = {
  entity: string;
  event: string;
  account_id?: string;
  contains: string[];
  payload: {
    payment?: { entity: RazorpayPaymentPayload }[];
    order?: { entity: Record<string, unknown> }[];
  };
};

export async function createRazorpayPaymentLink(
  orderId: string,
  amount: number,
  description: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
): Promise<{ short_url?: string; error?: string }> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return { error: 'Razorpay not configured' };
  }
  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/payment_links/', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference_id: orderId,
        amount: amount,
        currency: 'INR',
        description: description,
        customer: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone?.replace(/\D/g, ''),
        },
        reminder_enable: true,
        notify: { sms: true, email: true },
      }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error?.description ?? 'Failed to create payment link' };
    return { short_url: data.short_url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Network error' };
  }
}
