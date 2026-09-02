'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, ChevronRight, Search, Sparkles, X } from 'lucide-react';
import {
  aiRecommendations, casesSeed, channelPerformance, money, moneyL, riskReasons,
} from '@/lib/recovery-data';

type AIResponse = {
  summary: string;
  actions: { label: string; detail: string; amount?: number }[];
};

export function AICommandBar({ onNavigate }: { onNavigate: (section: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    'What should I prioritize right now?',
    'Show customers with more than ₹25,000 at risk.',
    'Why did revenue at risk increase?',
    'Show all critical cases.',
    'Which customers are most likely to pay?',
    'What is our best recovery strategy?',
    'Recover as much revenue as possible today.',
  ];

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (!q.trim()) { setResponse(null); setLoading(false); return; }
    setLoading(true);
    setResponse(null);

    setTimeout(() => {
      const lower = q.toLowerCase();
      let result: AIResponse;

      if (lower.includes('priorit')) {
        const criticalCases = casesSeed.filter((c) => c.risk === 'Critical' || c.risk === 'High');
        result = {
          summary: `I recommend focusing on ${criticalCases.length} critical and high-risk cases. Potential recovery: ${money(criticalCases.reduce((s, c) => s + c.amount, 0))}.`,
          actions: [
            { label: 'Retry 7 failed payments', detail: 'Temporary declines with strong payment history', amount: 58400 },
            { label: 'Escalate 3 enterprise customers', detail: 'High-value overdue invoices · needs approval', amount: 72000 },
            { label: 'Send WhatsApp reminders to 12 customers', detail: 'Checkout abandonment and missed promises', amount: 41200 },
            { label: 'Offer payment plans to 4 customers', detail: 'High outstanding amounts · needs approval', amount: 29600 },
          ],
        };
      } else if (lower.includes('critical')) {
        const critical = casesSeed.filter((c) => c.risk === 'Critical');
        result = {
          summary: `There are ${critical.length} critical cases totaling ${money(critical.reduce((s, c) => s + c.amount, 0))}. All require immediate attention.`,
          actions: critical.map((c) => ({
            label: c.customer, detail: `${c.type} · ${c.nextAction} · ${c.confidence}% confidence`, amount: c.amount,
          })),
        };
      } else if (lower.includes('likely to pay') || lower.includes('probability') || lower.includes('best recover')) {
        const sorted = [...casesSeed].sort((a, b) => b.probability - a.probability);
        result = {
          summary: `Based on recovery probability × outstanding amount × customer value, the top ${Math.min(5, sorted.length)} customers most likely to pay:`,
          actions: sorted.slice(0, 5).map((c) => ({
            label: c.customer, detail: `${c.probability}% recovery probability · ${money(c.amount)} at risk · ${c.nextAction}`, amount: c.amount,
          })),
        };
      } else if (lower.includes('recovery rate') || lower.includes('fall') || lower.includes('decreas')) {
        result = {
          summary: 'Recovery rate dipped 3.2% this week, driven by 12 expired card failures in the Enterprise segment. WhatsApp channel underperformed at 31% (vs 48% average).',
          actions: [
            { label: 'Target expired card recovery', detail: '32 expired cards identified · 68% historical success with payment update links' },
            { label: 'Switch to Email + Retry for Enterprise', detail: 'Email has 67% recovery rate for this segment vs 31% on WhatsApp' },
            { label: 'Review failed WhatsApp deliveries', detail: '4 messages bounced this week — check opt-in status' },
          ],
        };
      } else if (lower.includes('increase') || lower.includes('why did revenue') || lower.includes('at risk')) {
        result = {
          summary: `Revenue at risk increased 12.4% (+₹53,400), primarily because expired-card failures rose by 18% and overdue invoices increased by 9%.`,
          actions: [
            { label: 'Expired card failures', detail: 'Up 18% — 32 new cases this week', amount: 72000 },
            { label: 'Overdue invoices', detail: 'Up 9% — 18 new cases, 6 enterprise', amount: 61000 },
            { label: 'Insufficient funds', detail: 'Stable — 11 cases, mostly temporary', amount: 43000 },
          ],
        };
      } else if (lower.includes('strategy') || lower.includes('best')) {
        const sorted = [...channelPerformance].sort((a, b) => b.recoveryRate - a.recoveryRate);
        result = {
          summary: 'Based on 842 recovery cases, here are your recovery strategies ranked by success rate:',
          actions: sorted.map((ch) => ({
            label: `${ch.channel}`, detail: `${ch.cases} cases · ${ch.recoveryRate}% recovery rate`,
          })),
        };
      } else if (lower.includes('₹25') || lower.includes('25000') || lower.includes('more than')) {
        const filtered = casesSeed.filter((c) => c.amount > 25000);
        result = {
          summary: `Customers with more than ₹25,000 at risk — ${filtered.length} cases totaling ${money(filtered.reduce((s, c) => s + c.amount, 0))}:`,
          actions: filtered.map((c) => ({
            label: c.customer, detail: `${money(c.amount)} · ${c.risk} risk · ${c.probability}% probability · ${c.nextAction}`,
          })),
        };
      } else if (lower.includes('recover as much') || lower.includes('today') || lower.includes('maximum')) {
        result = {
          summary: `To maximize recovery today, I recommend executing all approved safe actions. Potential recovery: ${money(174000)}.`,
          actions: aiRecommendations.map((r) => ({
            label: r.action, detail: `${r.cases} cases · ${r.confidence}% confidence · ${r.requiresApproval ? 'Needs approval' : 'Safe to execute'}`, amount: r.expectedRecovery,
          })),
        };
      } else if (lower.includes('reason') || lower.includes('risk reason') || lower.includes('losing')) {
        result = {
          summary: 'Top reasons for revenue at risk across all 842 cases:',
          actions: riskReasons.map((r) => ({
            label: r.reason, detail: `${r.percentage}% of total at-risk revenue`, amount: r.amount,
          })),
        };
      } else {
        result = {
          summary: `I'm monitoring 842 recovery cases. ${money(485000)} is currently at risk with ${money(164000)} simulated as recovered (34% rate). Here are my top recommendations:`,
          actions: aiRecommendations.slice(0, 3).map((r) => ({
            label: r.action, detail: `${r.cases} cases · ${r.confidence}% confidence`, amount: r.expectedRecovery,
          })),
        };
      }
      setResponse(result);
      setLoading(false);
    }, 500);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-[#20354a] bg-[#0c1a2a] px-3 py-2 text-xs text-[#60778e] transition-colors hover:border-[#4f8cff] md:w-[320px]"
      >
        <Sparkles size={15} className="text-[#4f8cff]" />
        <span className="flex-1 text-left">Ask Revenue Recovery AI...</span>
        <Search size={14} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[12vh]" onClick={() => setOpen(false)}>
          <div className="w-full max-w-2xl rounded-xl border border-[#20354a] bg-[#0b1b2b] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-[#20354a] p-4">
              <Bot size={20} className="text-[#4f8cff]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Ask about priorities, risks, recovery strategies..."
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#60778e]"
                autoFocus
              />
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-[#8198ae] hover:bg-[#13263a]"><X size={18} /></button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-4">
              {!query && !response && (
                <div>
                  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#6f89a4]">Try asking</div>
                  <div className="space-y-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSearch(s)}
                        className="flex w-full items-center gap-3 rounded-lg border border-[#20354a] bg-[#091725] p-3 text-left text-xs text-[#a6b7c7] transition-colors hover:border-[#4f8cff] hover:text-white"
                      >
                        <Sparkles size={14} className="text-[#4f8cff]" />
                        {s}
                        <ChevronRight size={14} className="ml-auto text-[#5d7894]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-3 p-4 text-sm text-[#7f94aa]">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#20354a] border-t-[#4f8cff]" />
                  AI is analyzing your recovery data...
                </div>
              )}

              {response && !loading && (
                <div>
                  <div className="mb-4 flex items-start gap-3 rounded-lg border border-[#4f8cff]/20 bg-[#4f8cff]/5 p-4">
                    <Sparkles size={18} className="mt-0.5 shrink-0 text-[#4f8cff]" />
                    <p className="text-sm text-[#c8d6e5]">{response.summary}</p>
                  </div>
                  <div className="space-y-2">
                    {response.actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => { onNavigate('Recovery cases'); setOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-lg border border-[#20354a] bg-[#091725] p-3 text-left transition-colors hover:border-[#4f8cff]/40"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#4f8cff]/15 text-[11px] font-semibold text-[#83adff]">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-white">{action.label}</div>
                          <div className="mt-0.5 text-[11px] text-[#7f94aa]">{action.detail}</div>
                        </div>
                        {action.amount && <span className="shrink-0 text-xs font-semibold text-[#45d879]">{money(action.amount)}</span>}
                        <ChevronRight size={15} className="shrink-0 text-[#5d7894]" />
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => { onNavigate('Recovery cases'); setOpen(false); }}
                    className="mt-4 w-full rounded-lg bg-[#4f8cff] py-2.5 text-xs font-semibold text-white hover:bg-[#6099ff]"
                  >
                    Review Actions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
