import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/server-supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') ?? '50');
  const offset = parseInt(searchParams.get('offset') ?? '0');

  let query = serverSupabase
    .from('recovery_cases')
    .select(`
      *,
      customer:customers(id, name, email, phone),
      payment:payments(id, razorpay_payment_id, amount, currency, status, failure_reason, failure_code),
      actions:recovery_actions(id, action_type, channel, status, message, error_message, created_at, completed_at)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ cases: data });
}
