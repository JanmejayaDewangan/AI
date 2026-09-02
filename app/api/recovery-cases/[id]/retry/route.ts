import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/server-supabase';
import { getRecoveryConfig } from '@/lib/recovery-config';
import { createRazorpayPaymentLink } from '@/lib/razorpay';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { data: caseRecord } = await serverSupabase
    .from('recovery_cases')
    .select(`
      id, status, retry_count, amount_at_risk,
      payment:payments(id, razorpay_order_id),
      customer:customers(id, name, email, phone)
    `)
    .eq('id', params.id)
    .maybeSingle();

  if (!caseRecord) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }
  if (caseRecord.status === 'Recovered') {
    return NextResponse.json({ error: 'Case already recovered' }, { status: 400 });
  }

  const config = await getRecoveryConfig();
  if ((caseRecord.retry_count ?? 0) >= config.MAX_RETRY_ATTEMPTS) {
    return NextResponse.json({ error: 'Maximum retry attempts reached' }, { status: 400 });
  }

  const payment = caseRecord.payment as { razorpay_order_id: string | null };
  const customer = caseRecord.customer as { name: string; email: string | null; phone: string | null };

  const link = await createRazorpayPaymentLink(
    payment.razorpay_order_id ?? `recovery_${caseRecord.id}`,
    caseRecord.amount_at_risk,
    `Payment recovery for ${customer.name}`,
    customer.name,
    customer.email ?? '',
    customer.phone ?? '',
  );

  if (link.error) {
    await serverSupabase.from('recovery_actions').insert({
      recovery_case_id: caseRecord.id,
      action_type: 'retry_payment',
      channel: 'payment_link',
      status: 'failed',
      error_message: link.error,
      completed_at: new Date().toISOString(),
    });
    return NextResponse.json({ error: link.error }, { status: 500 });
  }

  await serverSupabase.from('recovery_actions').insert({
    recovery_case_id: caseRecord.id,
    action_type: 'retry_payment',
    channel: 'payment_link',
    status: 'sent',
    message: `Payment link: ${link.short_url}`,
    completed_at: new Date().toISOString(),
  });

  const nextRetry = new Date(Date.now() + config.RETRY_DELAY_MINUTES * 60 * 1000);
  await serverSupabase.from('recovery_cases').update({
    retry_count: (caseRecord.retry_count ?? 0) + 1,
    next_action_at: nextRetry.toISOString(),
    last_action: 'Retry payment link sent',
    status: 'Awaiting Payment',
  }).eq('id', caseRecord.id);

  return NextResponse.json({ paymentLink: link.short_url, nextRetryAt: nextRetry });
}
