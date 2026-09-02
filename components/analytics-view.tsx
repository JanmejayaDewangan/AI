'use client';

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, ArrowDownRight, ArrowUpRight, Bot, CircleDollarSign, TrendingUp, User } from 'lucide-react';
import { channelPerformance, lossAnalysis, money, moneyL, riskReasons } from '@/lib/recovery-data';
import { Kpi, PageTitle, SectionHeading } from '@/components/recovery-ui';

export function AnalyticsView() {
  return (
    <>
      <PageTitle
        title="Analytics"
        description="Measure verified recovery, not predicted outcomes."
        action={<button className="flex items-center gap-2 rounded-lg border border-[#2a4662] px-3.5 py-2.5 text-xs text-[#c8d6e5] hover:border-[#4f8cff]"><ArrowDownRight size={14} />Export CSV</button>}
      />

      {/* Top KPIs */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Total at risk" value={moneyL(1842000)} detail="Across 842 cases" trend="up" icon={Activity} color="amber" />
        <Kpi title="Verified recovered" value={moneyL(1176000)} detail="From successful payments" trend="up" icon={CircleDollarSign} color="green" />
        <Kpi title="Recovery rate" value="63.8%" detail="+8.4% vs last period" trend="up" icon={TrendingUp} color="blue" />
        <Kpi title="AI success rate" value="64.2%" detail="824 of 1,284 actions" trend="up" icon={Bot} color="slate" />
      </div>

      {/* AI vs Human Recovery */}
      <div className="mb-4 surface rounded-xl p-5">
        <SectionHeading eyebrow="Contribution" title="How much revenue did AI recover?" />
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr]">
          <div className="rounded-xl border border-[#20354a] bg-[#091725] p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4f8cff]/15 text-[#83adff]"><Bot size={18} /></div>
              <span className="text-xs font-medium text-white">AI recovery</span>
            </div>
            <div className="text-2xl font-semibold text-white">{moneyL(118368)}</div>
            <div className="mt-2 text-[11px] text-[#45d879]">72% of total recovery</div>
            <div className="mt-3 h-2 rounded-full bg-[#182d43]"><div className="h-2 rounded-full bg-[#4f8cff]" style={{ width: '72%' }} /></div>
          </div>
          <div className="rounded-xl border border-[#20354a] bg-[#091725] p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#a855f7]/15 text-[#c084fc]"><User size={18} /></div>
              <span className="text-xs font-medium text-white">Human recovery</span>
            </div>
            <div className="text-2xl font-semibold text-white">{moneyL(46032)}</div>
            <div className="mt-2 text-[11px] text-[#c084fc]">28% of total recovery</div>
            <div className="mt-3 h-2 rounded-full bg-[#182d43]"><div className="h-2 rounded-full bg-[#a855f7]" style={{ width: '28%' }} /></div>
          </div>
          <div className="rounded-xl border border-[#20354a] bg-[#091725] p-5">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[.12em] text-[#6f89a4]">AI performance</div>
            <div className="text-2xl font-semibold text-white">1,284</div>
            <div className="mt-1 text-[11px] text-[#7f94aa]">total actions taken</div>
            <div className="mt-3 space-y-1 text-[11px]">
              <div className="flex justify-between"><span className="text-[#7f94aa]">Successful</span><span className="text-white">824</span></div>
              <div className="flex justify-between"><span className="text-[#7f94aa]">Human escalations</span><span className="text-white">83</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Best Recovery Strategies */}
      <div className="mb-4 grid gap-4 xl:grid-cols-2">
        <div className="surface rounded-xl p-5">
          <SectionHeading eyebrow="Performance" title="Best recovery strategies" />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelPerformance} layout="vertical">
                <CartesianGrid stroke="#20354a" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#7189a1', fontSize: 10 }} />
                <YAxis type="category" dataKey="channel" axisLine={false} tickLine={false} tick={{ fill: '#7189a1', fontSize: 11 }} width={100} />
                <Tooltip contentStyle={{ background: '#13263a', border: '1px solid #2c4a67', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="recoveryRate" radius={[0, 4, 4, 0]}>
                  {channelPerformance.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2 border-t border-[#20354a] pt-3">
            {channelPerformance.map((c) => (
              <div key={c.channel} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-2 text-[#a9bacb]">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  {c.channel}
                </span>
                <span className="text-white">{c.cases} cases · <span className="font-semibold">{c.recoveryRate}%</span></span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface rounded-xl p-5">
          <SectionHeading eyebrow="Loss analysis" title="Where are we losing money?" />
          <div className="space-y-4">
            {lossAnalysis.map((l) => (
              <div key={l.reason}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-[#a9bacb]">{l.reason}</span>
                  <span className="font-semibold text-white">{money(l.amount)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#182d43]">
                  <div className="h-2.5 rounded-full bg-red-400/70" style={{ width: `${(l.amount / 120000) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-[#20354a] pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#7f94aa]">Total unrecovered</span>
              <span className="font-semibold text-red-300">{moneyL(lossAnalysis.reduce((s, l) => s + l.amount, 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recovery by failure reason (pie) */}
      <div className="mb-4 grid gap-4 xl:grid-cols-2">
        <div className="surface rounded-xl p-5">
          <SectionHeading eyebrow="Top drivers" title="Recovery by failure reason" />
          <div className="flex items-center gap-4">
            <div className="h-[220px] w-[220px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskReasons} dataKey="percentage" nameKey="reason" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                    {riskReasons.map((r, i) => <Cell key={i} fill={r.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#13263a', border: '1px solid #2c4a67', borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {riskReasons.map((r) => (
                <div key={r.reason} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-2 text-[#a9bacb]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                    {r.reason}
                  </span>
                  <span className="font-semibold text-white">{r.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="surface rounded-xl p-5">
          <SectionHeading eyebrow="Revenue breakdown" title="Recovery by source" />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Payments', value: 420 }, { name: 'Subs', value: 318 },
                { name: 'Checkout', value: 176 }, { name: 'Invoices', value: 242 },
                { name: 'Mandates', value: 96 },
              ]}>
                <CartesianGrid stroke="#20354a" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7189a1', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7189a1', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#13263a', border: '1px solid #2c4a67', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="value" fill="#4f8cff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
