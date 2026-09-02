export type EmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string,
): Promise<EmailResult> {
  const apiKey = process.env.EMAIL_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'Email API not configured' };
  }
  const fromEmail = process.env.EMAIL_FROM ?? 'recovery@example.com';
  const provider = process.env.EMAIL_PROVIDER ?? 'sendgrid';

  if (provider === 'sendgrid') {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromEmail },
          subject: subject,
          content: [{ type: 'text/html', value: htmlBody }],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.errors?.[0]?.message ?? 'Email send failed' };
      }
      const messageId = res.headers.get('x-message-id') ?? undefined;
      return { success: true, messageId: messageId ?? undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
  }

  if (provider === 'resend') {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: to,
          subject: subject,
          html: htmlBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message ?? 'Email send failed' };
      }
      return { success: true, messageId: data.id };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
  }

  return { success: false, error: `Unsupported email provider: ${provider}` };
}
