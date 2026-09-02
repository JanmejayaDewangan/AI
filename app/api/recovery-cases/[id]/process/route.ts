import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/server-supabase';
import { runDecisionEngine, executeAction } from '@/lib/recovery-engine';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { data: caseRecord } = await serverSupabase
    .from('recovery_cases')
    .select(`
      id, status, payment_id, customer_id, amount_at_risk, retry_count,
      payment:payments(id, razorpay_payment_id, razorpay_order_id, amount, failure_reason, failure_code),
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

  const payment = caseRecord.payment as { razorpay_payment_id: string; razorpay_order_id: string | null; amount: number; failure_reason: string | null; failure_code: string | null };
  const customer = caseRecord.customer as { name: string; email: string | null; phone: string | null };

  const decision = await runDecisionEngine({
    paymentId: payment.razorpay_payment_id,
    customerId: caseRecord.customer_id ?? '',
    amount: caseRecord.amount_at_risk,
    failureCode: payment.failure_code,
    failureDescription: payment.failure_reason,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
  });

  await serverSupabase.from('recovery_cases').update({
    ai_analysis: decision.analysis as unknown as Record<string, unknown>,
    ai_recommendation: { action: decision.action, provider: decision.provider, policyNote: decision.policyNote } as unknown as Record<string, unknown>,
    selected_action: decision.action,
    diagnosis: decision.analysis.explanation,
    next_action_at: decision.nextActionAt?.toISOString() ?? null,
    status: 'Recovery in Progress',
  }).eq('id', params.id);

  const result = await executeAction({
    caseId: params.id,
    action: decision.action,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    amount: caseRecord.amount_at_risk,
    orderId: payment.razorpay_order_id,
  });

  await serverSupabase.from('recovery_cases').update({
    retry_count: (caseRecord.retry_count ?? 0) + 1,
    last_action: `${decision.action} ${result.success ? 'sent' : 'failed'}`,
  }).eq('id', params.id);

  return NextResponse.json({
    action: decision.action,
    analysis: decision.analysis,
    policyNote: decision.policyNote,
    nextActionAt: decision.nextActionAt,
    executionResult: result,
  });
}
