import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/server-supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { data, error } = await serverSupabase
    .from('recovery_cases')
    .select(`
      *,
      customer:customers(id, name, email, phone),
      payment:payments(id, razorpay_payment_id, amount, currency, status, failure_reason, failure_code, created_at),
      actions:recovery_actions(id, action_type, channel, status, message, provider_message_id, error_message, created_at, completed_at)
    `)
    .eq('id', params.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }
  return NextResponse.json({ case: data });
}
