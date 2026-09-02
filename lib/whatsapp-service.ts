export type WhatsAppResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export async function sendWhatsApp(
  phone: string,
  message: string,
): Promise<WhatsAppResult> {
  const apiKey = process.env.WHATSAPP_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'WhatsApp API not configured' };
  }
  const apiUrl = process.env.WHATSAPP_API_URL ?? 'https://graph.facebook.com/v17.0';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!phoneNumberId) {
    return { success: false, error: 'WhatsApp phone number ID not configured' };
  }
  try {
    const res = await fetch(`${apiUrl}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone.replace(/\D/g, ''),
        type: 'text',
        text: { body: message },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error?.message ?? 'WhatsApp send failed' };
    }
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}
