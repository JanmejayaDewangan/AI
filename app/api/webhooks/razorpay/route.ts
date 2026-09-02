import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/server-supabase';
import { verifyRazorpaySignature, type RazorpayWebhookEvent } from '@/lib/razorpay';
import { runDecisionEngine, executeAction } from '@/lib/recovery-engine';

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  if (!verifyRazorpaySignature(bodyText, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventId = event.account_id ? `${event.account_id}_${event.event}_${Date.now()}` : `evt_${Date.now()}`;
  const eventType = event.event;

  // Idempotency: check if already processed
  const { data: existing } = await serverSupabase
    .from('webhook_events')
    .select('id, processed')
    .eq('provider', 'razorpay')
    .eq('event_id', eventId)
    .maybeSingle();

  if (existing?.processed) {
    return NextResponse.json({ status: 'already_processed' });
  }

  // Store the webhook event
  if (!existing) {
    await serverSupabase.from('webhook_events').insert({
      provider: 'razorpay',
      event_id: eventId,
      event_type: eventType,
      payload: JSON.parse(bodyText),
      processed: false,
    });
  }

  try {
    if (eventType === 'payment.failed') {
      await handlePaymentFailed(event);
    } else if (
      eventType === 'payment.authorized' ||
      eventType === 'payment.captured' ||
      eventType === 'order.paid'
    ) {
      await handlePaymentSuccess(event);
    } else {
      // Unknown event type — mark as processed without action
    }

    await serverSupabase
      .from('webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('provider', 'razorpay')
      .eq('event_id', eventId);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Processing failed' },
      { status: 500 },
    );
  }

  return NextResponse.json({ status: 'processed' });
}

async function handlePaymentFailed(event: RazorpayWebhookEvent) {
  const payment = event.payload.payment?.[0]?.entity;
  if (!payment) return;

  // Find or create customer
  let customerId: string | null = null;
  if (payment.email || payment.contact) {
    const { data: existingCustomer } = await serverSupabase
      .from('customers')
      .select('id')
      .or(`email.eq.${payment.email ?? ''}`)
      .maybeSingle();
    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer } = await serverSupabase
        .from('customers')
        .insert({
          name: payment.notes?.name ?? 'Unknown',
          email: payment.email ?? null,
          phone: payment.contact ?? null,
        })
        .select('id')
        .single();
      customerId = newCustomer?.id ?? null;
    }
  }

  // Find or create payment record
  const { data: existingPayment } = await serverSupabase
    .from('payments')
    .select('id')
    .eq('razorpay_payment_id', payment.id)
    .maybeSingle();

  let paymentId: string;
  if (existingPayment) {
    paymentId = existingPayment.id;
    await serverSupabase
      .from('payments')
      .update({
        status: 'failed',
        failure_reason: payment.error_description ?? null,
        failure_code: payment.error_code != null ? String(payment.error_code) : null,
      })
      .eq('id', paymentId);
  } else {
    const { data: newPayment } = await serverSupabase
      .from('payments')
      .insert({
        customer_id: customerId,
        razorpay_payment_id: payment.id,
        razorpay_order_id: payment.order_id ?? null,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: 'failed',
        failure_reason: payment.error_description ?? null,
        failure_code: payment.error_code != null ? String(payment.error_code) : null,
      })
      .select('id')
      .single();
    paymentId = newPayment?.id;
    if (!paymentId) return;
  }

  // Check if recovery case already exists for this payment
  const { data: existingCase } = await serverSupabase
    .from('recovery_cases')
    .select('id, status')
    .eq('payment_id', paymentId)
    .maybeSingle();

  if (existingCase) {
    return; // Already has a recovery case
  }

  // Get customer details for AI analysis
  let customerName = 'Unknown';
  let customerEmail: string | null = null;
  let customerPhone: string | null = null;
  if (customerId) {
    const { data: customer } = await serverSupabase
      .from('customers')
      .select('name, email, phone')
      .eq('id', customerId)
      .maybeSingle();
    if (customer) {
      customerName = customer.name;
      customerEmail = customer.email;
      customerPhone = customer.phone;
    }
  }

  // Run AI analysis + decision engine
  const decision = await runDecisionEngine({
    paymentId,
    customerId: customerId ?? '',
    amount: payment.amount / 100,
    failureCode: payment.error_code != null ? String(payment.error_code) : null,
    failureDescription: payment.error_description ?? null,
    customerName,
    customerEmail,
    customerPhone,
  });

  // Create recovery case
  const { data: newCase } = await serverSupabase
    .from('recovery_cases')
    .insert({
      payment_id: paymentId,
      customer_id: customerId,
      customer_name: customerName,
      customer_ref: customerId ?? 'N/A',
      event_type: 'Payment failed',
      amount_at_risk: payment.amount / 100,
      status: 'Recovery in Progress',
      risk_level: decision.analysis.priority === 'high' ? 'Critical' : decision.analysis.priority === 'medium' ? 'Medium' : 'Low',
      diagnosis: decision.analysis.explanation,
      failure_reason: payment.error_description ?? null,
      failure_code: payment.error_code != null ? String(payment.error_code) : null,
      ai_analysis: decision.analysis as unknown as Record<string, unknown>,
      ai_recommendation: { action: decision.action, provider: decision.provider, policyNote: decision.policyNote } as unknown as Record<string, unknown>,
      selected_action: decision.action,
      retry_count: 0,
      next_action_at: decision.nextActionAt?.toISOString() ?? null,
    })
    .select('id')
    .single();

  if (!newCase) return;

  // Execute the selected action
  await executeAction({
    caseId: newCase.id,
    action: decision.action,
    customerName,
    customerEmail,
    customerPhone,
    amount: payment.amount / 100,
    orderId: payment.order_id,
  });
}

async function handlePaymentSuccess(event: RazorpayWebhookEvent) {
  const payment = event.payload.payment?.[0]?.entity;
  if (!payment) return;

  // Update payment status
  const { data: paymentRecord } = await serverSupabase
    .from('payments')
    .select('id, customer_id')
    .eq('razorpay_payment_id', payment.id)
    .maybeSingle();

  if (paymentRecord) {
    await serverSupabase
      .from('payments')
      .update({ status: event.event === 'payment.captured' ? 'captured' : 'authorized' })
      .eq('id', paymentRecord.id);

    // Find and update recovery case
    const { data: recoveryCase } = await serverSupabase
      .from('recovery_cases')
      .select('id, status')
      .eq('payment_id', paymentRecord.id)
      .maybeSingle();

    if (recoveryCase && recoveryCase.status !== 'Recovered') {
      await serverSupabase
        .from('recovery_cases')
        .update({
          status: 'Recovered',
          recovered_at: new Date().toISOString(),
          next_action_at: null,
          verified_payment: true,
          last_action: 'Payment successful',
          recovered_amount: payment.amount / 100,
        })
        .eq('id', recoveryCase.id);

      // Log the successful recovery action
      await serverSupabase.from('recovery_actions').insert({
        recovery_case_id: recoveryCase.id,
        action_type: 'retry_payment',
        channel: 'webhook',
        status: 'completed',
        message: 'Payment confirmed via Razorpay webhook',
        completed_at: new Date().toISOString(),
      });
    }
  }
}

export async function GET() {
  return NextResponse.json({ endpoint: 'razorpay webhook', method: 'POST' });
}
