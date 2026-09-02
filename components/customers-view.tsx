'use client';

import { useState } from 'react';
import { Activity, ArrowUpRight, Check, ChevronRight, CreditCard, FileClock, MessageSquareText, Plus, Users, X, Zap } from 'lucide-react';
import { customersSeed, money, type Customer } from '@/lib/recovery-data';
import { ConfidenceMeter, Kpi, PageTitle, ProgressBar } from '@/components/recovery-ui';

export function CustomersView() {
  const [selected, setSelected] = useState<Customer | null>(null);

  return (
    <>
      <PageTitle
        title="Customers"
        description="Customer health, outstanding balances, and recovery history."
        action={<button className="flex items-center gap-2 rounded-lg bg-[#4f8cff] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#6099ff]"><Plus size={14} />Add customer</button>}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Total customers" value="1,248" detail="+42 this month" trend="up" icon={Users} color="blue" />
        <Kpi title="Healthy" value="1,104" detail="88.5% of base" trend="up" icon={Check} color="green" />
        <Kpi title="At risk" value="98" detail="Need attention" trend="down" icon={Activity} color="amber" />
        <Kpi title="Critical" value="46" detail="Active escalation" trend="down" icon={Activity} color="red" />
      </div>
      <div className="surface overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="border-b border-[#20354a] text-[10px] uppercase tracking-[.12em] text-[#647d96]">
              <tr>
                {['Customer', 'Email', 'Lifetime value', 'Outstanding', 'Plan', 'Health', 'Risk score', 'Recovery prob.', ''].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {customersSeed.map((c) => (
                <tr key={c.ref} onClick={() => setSelected(c)} className="data-row cursor-pointer border-b border-[#20354a]/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${c.health === 'Healthy' ? 'bg-green-400/10 text-green-400' : c.health === 'At Risk' ? 'bg-amber-400/10 text-amber-300' : 'bg-red-400/10 text-red-300'}`}>
                        <Users size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-white">{c.name}</div>
                        <div className="text-[10px] text-[#7189a1]">{c.ref}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-[#a9bacb]">{c.email}</td>
                  <td className="px-5 py-4 text-xs font-semibold text-white">{money(c.ltv)}</td>
                  <td className="px-5 py-4 text-xs text-[#f0b44f]">{c.outstanding > 0 ? money(c.outstanding) : '—'}</td>
                  <td className="px-5 py-4 text-xs text-[#9bb0c4]">{c.plan}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-md px-2 py-1 text-[11px] ${c.health === 'Healthy' ? 'text-green-300 bg-green-400/10' : c.health === 'At Risk' ? 'text-amber-300 bg-amber-400/10' : 'text-red-300 bg-red-400/10'}`}>{c.health}</span>
                  </td>
                  <td className="px-5 py-4"><span className={c.riskScore >= 70 ? 'text-red-300' : c.riskScore >= 40 ? 'text-amber-300' : 'text-green-300'}>{c.riskScore}</span></td>
                  <td className="px-5 py-4"><ConfidenceMeter value={c.recoveryProbability} /></td>
                  <td className="px-5 py-4 text-right"><ChevronRight size={15} className="text-[#5d7894]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selected && <Customer360 customer={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function Customer360({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/45">
      <button aria-label="Close" className="absolute inset-0 cursor-default" onClick={onClose} />
      <aside className="relative h-full w-full max-w-[560px] overflow-y-auto border-l border-[#20354a] bg-[#0b1b2b] shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-[#20354a] bg-[#0b1b2b]/95 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${customer.health === 'Healthy' ? 'bg-green-400/10 text-green-400' : customer.health === 'At Risk' ? 'bg-amber-400/10 text-amber-300' : 'bg-red-400/10 text-red-300'}`}>
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{customer.name}</h2>
                <div className="mt-0.5 text-xs text-[#7f94aa]">{customer.ref} · {customer.email}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] ${customer.health === 'Healthy' ? 'text-green-300 bg-green-400/10' : customer.health === 'At Risk' ? 'text-amber-300 bg-amber-400/10' : 'text-red-300 bg-red-400/10'}`}>{customer.health}</span>
                  <span className="text-[10px] text-[#7f94aa]">{customer.plan}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-[#8198ae] hover:bg-[#13263a] hover:text-white"><X size={18} /></button>
          </div>
        </div>

        <div className="p-6">
          {/* Key Metrics */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <MetricCard label="Lifetime value" value={money(customer.ltv)} />
            <MetricCard label="Revenue at risk" value={customer.outstanding > 0 ? money(customer.outstanding) : '—'} highlight={customer.outstanding > 0 ? 'amber' : undefined} />
            <MetricCard label="Successful payments" value={String(customer.successfulPayments)} />
            <MetricCard label="Failed payments" value={String(customer.failedPayments)} highlight={customer.failedPayments > 0 ? 'red' : undefined} />
            <MetricCard label="Open invoices" value={String(customer.openInvoices)} />
            <MetricCard label="Recovery probability" value={`${customer.recoveryProbability}%`} highlight="green" />
          </div>

          {/* Risk Score */}
          <div className="mb-6 surface rounded-xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-white">Risk score</span>
              <span className={`text-sm font-semibold ${customer.riskScore >= 70 ? 'text-red-300' : customer.riskScore >= 40 ? 'text-amber-300' : 'text-green-300'}`}>{customer.riskScore}/100</span>
            </div>
            <ProgressBar value={customer.riskScore} max={100} color={customer.riskScore >= 70 ? '#ef4444' : customer.riskScore >= 40 ? '#f59e0b' : '#22c55e'} />
            <div className="mt-2 flex justify-between text-[10px] text-[#6f89a4]"><span>Low risk</span><span>High risk</span></div>
          </div>

          {/* AI Recommendation */}
          <div className="mb-6 surface overflow-hidden rounded-xl border-l-2 border-l-[#4f8cff]">
            <div className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Zap size={15} className="text-[#83adff]" />
                <span className="text-xs font-semibold text-white">AI Recommendation</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#a1b2c4]">
                {customer.health === 'Critical'
                  ? `Escalate to account manager. ${customer.name} has ${money(customer.outstanding)} outstanding with a ${customer.recoveryProbability}% recovery probability. High-value customer with strong payment history suggests ability to pay.`
                  : customer.health === 'At Risk'
                  ? `Send WhatsApp reminder and offer payment plan. ${customer.name} has ${customer.failedPayments} failed payment(s) but ${customer.successfulPayments} successful payments. Recovery probability is ${customer.recoveryProbability}%.`
                  : `${customer.name} is healthy with no outstanding amounts. Monitor for payment failures and maintain regular engagement.`}
              </p>
              <div className="mt-3 flex gap-2">
                <button className="rounded-lg bg-[#22c55e] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#2bd96c]">Approve Action</button>
                <button className="rounded-lg border border-[#29445f] px-3 py-2 text-[11px] text-[#a6b7c7] hover:border-[#4f8cff]">Review</button>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="mb-6">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#6f89a4]">Payment history</div>
            <div className="space-y-2">
              {[
                ['10 Aug 2026', 'INV_2045', 12499, 'Successful', 'green'],
                ['10 Jul 2026', 'INV_2032', 12499, 'Successful', 'green'],
                ['10 Jun 2026', 'INV_2018', 12499, 'Failed', 'red'],
                ['10 May 2026', 'INV_2004', 12499, 'Successful', 'green'],
              ].map(([date, inv, amt, status, tone], i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-[#20354a] bg-[#091725] p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone === 'green' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-300'}`}>
                      <CreditCard size={15} />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">{inv as string}</div>
                      <div className="text-[10px] text-[#7189a1]">{date as string}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-white">{money(amt as number)}</div>
                    <div className={`text-[10px] ${tone === 'green' ? 'text-green-400' : 'text-red-300'}`}>{status as string}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Communication History */}
          <div>
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#6f89a4]">Communication history</div>
            <div className="space-y-2">
              {[
                ['17 Aug 2026 17:13', 'WhatsApp', 'Payment update request sent', 'Delivered'],
                ['17 Aug 2026 17:12', 'Email', 'Invoice reminder sent', 'Opened'],
                ['15 Aug 2026 09:00', 'WhatsApp', 'Payment reminder sent', 'Read'],
              ].map(([time, channel, msg, status], i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-[#20354a] bg-[#091725] p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a3553] text-[#78aaff]">
                    <MessageSquareText size={15} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white">{msg as string}</div>
                    <div className="text-[10px] text-[#7189a1]">{time as string} · {channel as string}</div>
                  </div>
                  <span className="text-[10px] text-[#9bb0c4]">{status as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function MetricCard({ label, value, highlight }: { label: string; value: string; highlight?: 'green' | 'amber' | 'red' }) {
  const color = highlight === 'green' ? 'text-[#45d879]' : highlight === 'amber' ? 'text-[#f0b44f]' : highlight === 'red' ? 'text-red-300' : 'text-white';
  return (
    <div className="surface rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-[.12em] text-[#6f89a4]">{label}</div>
      <div className={`mt-2 text-lg font-semibold ${color}`}>{value}</div>
    </div>
  );
}
