'use client';

import { useState } from 'react';
import {
  AlertTriangle, Check, ChevronDown, ChevronRight, CircleDollarSign, MessageSquareText,
  MoreHorizontal, ShieldCheck, Sparkles, TrendingUp, X, Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  customerHistory, money, recoveryScores, strategyComparisons, type Case,
} from '@/lib/recovery-data';
import { ConfidenceMeter, SectionHeading, StatusBadge } from '@/components/recovery-ui';

const recoveryStages = ['Detected', 'Diagnosed', 'Contacted', 'Awaiting Payment', 'Recovered'];

export function CaseDrawer({ item, onClose }: { item: Case; onClose: () => void }) {
  const [showStrategy, setShowStrategy] = useState(false);
  const [showScore, setShowScore] = useState(false);

  const currentStageIndex = recoveryStages.findIndex((s) =>
    item.status === 'Recovered' ? s === 'Recovered' :
    item.status === 'Escalated' ? s === 'Awaiting Payment' :
    item.status === 'Awaiting Payment' ? s === 'Awaiting Payment' :
    item.status === 'Recovery in Progress' ? s === 'Contacted' :
    s === 'Diagnosed'
  );

  const strategies = strategyComparisons[item.id] ?? [];
  const scoreData = recoveryScores[item.id];
  const history = customerHistory[item.id];
  const isRecovered = item.status === 'Recovered';
  const nextActionLabel = isRecovered ? 'Verify simulated recovery' : item.nextAction;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/45">
      <button aria-label="Close detail" className="absolute inset-0 cursor-default" onClick={onClose} />
      <aside className="relative h-full w-full max-w-[580px] overflow-y-auto border-l border-[#20354a] bg-[#0b1b2b] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[#20354a] bg-[#0b1b2b]/95 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-1 font-mono text-[11px] text-[#75a5ff]">{item.id}</div>
              <h2 className="text-xl font-semibold text-white">{item.customer}</h2>
              <div className="mt-1 text-xs text-[#7f94aa]">{item.ref} · {item.type}</div>
            </div>
            <button aria-label="Close" onClick={onClose} className="rounded-lg p-2 text-[#8198ae] hover:bg-[#13263a] hover:text-white"><X size={18} /></button>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-red-400/10 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span className="text-xs font-semibold text-red-300">{money(item.amount)} AT RISK</span>
            </div>
            <StatusBadge status={item.status} />
            {isRecovered && <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">SIMULATED</span>}
          </div>
        </div>

        <div className="p-6">
          {/* Recovery Progress */}
          <div className="mb-6">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#6f89a4]">Recovery status</div>
            <div className="flex items-center gap-1">
              {recoveryStages.map((stage, i) => (
                <div key={stage} className="flex flex-1 flex-col items-center">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold transition-all ${
                    i <= currentStageIndex ? 'bg-[#4f8cff] text-white' : 'bg-[#182d43] text-[#5d7894]'
                  }`}>
                    {i < currentStageIndex ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`mt-1.5 text-center text-[9px] ${i <= currentStageIndex ? 'text-white' : 'text-[#5d7894]'}`}>{stage}</span>
                </div>
              ))}
            </div>
            {isRecovered && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#20354a] bg-[#091725] p-2.5 text-[10px] text-[#7f94aa]">
                <span className="text-[#6f89a4]">Recovery action</span>
                <ChevronRight size={11} className="text-[#5d7894]" />
                <span className="text-[#9eb1c2]">Payment successful</span>
                <ChevronRight size={11} className="text-[#5d7894]" />
                <span className="text-[#9eb1c2]">Payment verification</span>
                <ChevronRight size={11} className="text-[#5d7894]" />
                <span className="font-medium text-[#45d879]">Recovery confirmed</span>
              </div>
            )}
          </div>

          {/* Case Summary */}
          <div className="mb-6">
            <SectionHeading eyebrow="Case summary" title="Key details" />
            <div className="grid grid-cols-2 gap-3">
              <SummaryItem label="Amount at risk" value={money(item.amount)} />
              <SummaryItem label="Days overdue" value={item.type === 'Invoice overdue' ? '31' : '—'} />
              <SummaryItem label="Recovery probability" value={`${item.probability}%`} highlight={item.probability >= 85 ? 'green' : 'amber'} />
              <SummaryItem label="AI confidence" value={`${item.confidence}%`} highlight={item.confidence >= 85 ? 'green' : 'amber'} />
              <SummaryItem label="Owner" value={item.owner} />
              <SummaryItem label="Deadline" value={item.deadline} highlight="amber" />
            </div>
          </div>

          {/* Problem + Customer History */}
          <div className="mb-6">
            <SectionHeading eyebrow="Risk analysis" title="Problem & customer history" />
            <div className="surface rounded-xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-300" />
                <span className="text-xs font-medium text-white">{item.diagnosis}</span>
              </div>
              {history && (
                <div className="grid grid-cols-2 gap-3 border-t border-[#20354a] pt-3">
                  <HistoryItem label="Previous invoices" value={String(history.invoices)} />
                  <HistoryItem label="Successfully paid" value={String(history.successfulPayments)} />
                  <HistoryItem label="Avg. payment delay" value={history.avgDelayDays} />
                  <HistoryItem label="Previous recovery" value={history.previousRecovery} highlight={history.previousRecovery === 'Successful' ? 'green' : undefined} />
                </div>
              )}
              <div className="mt-3 border-t border-[#20354a] pt-3">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#6f89a4]">Evidence</div>
                <ul className="space-y-1.5">
                  {item.evidence.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-[#9eb1c2]">
                      <Check size={13} className="mt-0.5 shrink-0 text-[#22c55e]" /> {e}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* AI Strategy Comparison */}
          {strategies.length > 0 && (
            <div className="mb-6">
              <SectionHeading
                eyebrow="AI reasoning"
                title="Strategy comparison"
                action={
                  <button onClick={() => setShowStrategy(!showStrategy)} className="flex items-center gap-1 text-[11px] text-[#72a2ff] hover:text-white">
                    {showStrategy ? 'Hide' : 'Show'} <ChevronDown size={13} className={`transition-transform ${showStrategy ? 'rotate-180' : ''}`} />
                  </button>
                }
              />
              {showStrategy && (
                <div className="surface overflow-hidden rounded-xl">
                  <table className="w-full text-left">
                    <thead className="border-b border-[#20354a] text-[10px] uppercase tracking-[.12em] text-[#6f89a4]">
                      <tr>
                        <th className="px-4 py-2.5 font-medium">Action</th>
                        <th className="px-3 py-2.5 font-medium text-right">Recovery</th>
                        <th className="px-3 py-2.5 font-medium">Friction</th>
                        <th className="px-4 py-2.5 font-medium">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {strategies.map((s) => (
                        <tr key={s.action} className={`border-b border-[#20354a]/60 ${s.selected ? 'bg-[#4f8cff]/5' : ''}`}>
                          <td className="px-4 py-3 text-[11px] font-medium text-white">
                            {s.selected && <Check size={12} className="mr-1 inline text-[#4f8cff]" />}
                            {s.action}
                          </td>
                          <td className="px-3 py-3 text-right text-[11px] font-semibold text-white">{s.recoveryProbability}%</td>
                          <td className="px-3 py-3 text-[11px] text-[#9eb1c2]">{s.customerFriction}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[11px] ${s.riskLevel === 'High' ? 'text-red-300' : s.riskLevel === 'Medium' ? 'text-amber-300' : 'text-green-300'}`}>{s.riskLevel}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="border-t border-[#20354a] p-3 text-[11px] text-[#7f94aa]">
                    <span className="font-medium text-white">AI selected: {strategies.find((s) => s.selected)?.action}</span>
                    <p className="mt-1">Highest expected recovery with lowest customer friction.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recovery Score */}
          {scoreData && (
            <div className="mb-6">
              <SectionHeading
                eyebrow="Scoring"
                title="Recovery score"
                action={
                  <button onClick={() => setShowScore(!showScore)} className="flex items-center gap-1 text-[11px] text-[#72a2ff] hover:text-white">
                    {showScore ? 'Hide' : 'Show'} breakdown <ChevronDown size={13} className={`transition-transform ${showScore ? 'rotate-180' : ''}`} />
                  </button>
                }
              />
              <div className="surface rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-white">{scoreData.score}<span className="text-base text-[#6f89a4]">/100</span></div>
                    <div className="text-[11px] text-[#7f94aa]">Recovery score</div>
                  </div>
                  <div className="h-16 w-16">
                    <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-[#182d43]">
                      <div className="text-center">
                        <TrendingUp size={18} className={scoreData.score >= 85 ? 'text-[#45d879]' : 'text-[#f0b44f]'} />
                      </div>
                    </div>
                  </div>
                </div>
                {showScore && (
                  <div className="mt-4 space-y-2 border-t border-[#20354a] pt-3">
                    {scoreData.factors.map((f) => (
                      <div key={f.factor} className="flex items-center justify-between text-[11px]">
                        <span className="text-[#9eb1c2]">{f.factor}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-[#182d43]">
                            <div className="h-1.5 rounded-full bg-[#4f8cff]" style={{ width: `${(f.points / f.max) * 100}%` }} />
                          </div>
                          <span className="w-12 text-right font-medium text-white">+{f.points}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Recommendation / Next Best Action */}
          <div className="mb-6">
            <SectionHeading eyebrow="AI recommendation" title="Next best action" action={<span className="flex items-center gap-1.5 rounded-lg bg-[#4f8cff]/10 px-2.5 py-1 text-[10px] font-medium text-[#83adff]"><Sparkles size={12} />AI generated</span>} />
            <div className="surface overflow-hidden rounded-xl border-l-2 border-l-[#4f8cff]">
              <div className="p-4">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4f8cff]/15 text-[#83adff]"><Zap size={18} /></div>
                  <div>
                    <div className="text-sm font-semibold text-white">{nextActionLabel}</div>
                    <div className="mt-1 text-[11px] text-[#7f94aa]">
                      {isRecovered ? 'Simulated payment has been verified as successful.' : `Expected recovery: ${money(item.amount)}`}
                    </div>
                  </div>
                </div>

                {/* Why this action */}
                <div className="mt-4 rounded-lg border border-[#20354a] bg-[#091725] p-3">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#6f89a4]">Why this action?</div>
                  <p className="text-[11px] leading-relaxed text-[#a1b2c4]">{item.nextActionReason}</p>
                </div>

                {/* Key metrics */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-[#091725] p-2 text-center">
                    <div className="text-[9px] uppercase tracking-[.1em] text-[#6f89a4]">Probability</div>
                    <div className="mt-1 text-sm font-semibold text-white">{item.probability}%</div>
                  </div>
                  <div className="rounded-lg bg-[#091725] p-2 text-center">
                    <div className="text-[9px] uppercase tracking-[.1em] text-[#6f89a4]">Confidence</div>
                    <div className={`mt-1 text-sm font-semibold ${item.confidence >= 85 ? 'text-[#45d879]' : 'text-[#f0b44f]'}`}>{item.confidence}%</div>
                  </div>
                  <div className="rounded-lg bg-[#091725] p-2 text-center">
                    <div className="text-[9px] uppercase tracking-[.1em] text-[#6f89a4]">Policy</div>
                    <div className="mt-1 font-mono text-[10px] font-semibold text-[#94b6dc]">{item.policy}</div>
                  </div>
                </div>

                {/* Policy check status */}
                <div className={`mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] ${
                  item.risk === 'Critical' || item.amount > 50000
                    ? 'border-amber-400/20 bg-amber-400/5 text-amber-200'
                    : 'border-[#214b35] bg-[#10291b] text-[#8fcaa3]'
                }`}>
                  <ShieldCheck size={14} className={item.risk === 'Critical' || item.amount > 50000 ? 'text-amber-400' : 'text-[#45d879]'} />
                  <span>
                    Policy check: <span className="font-semibold">{item.policy} · {item.risk === 'Critical' || item.amount > 50000 ? 'HUMAN APPROVAL REQUIRED' : 'APPROVED'}</span>
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 border-t border-[#20354a] p-4">
                {isRecovered ? (
                  <button className="flex-1 rounded-lg bg-[#22c55e] py-2.5 text-xs font-semibold text-white hover:bg-[#2bd96c]">View payment</button>
                ) : (
                  <>
                    <button className="flex-1 rounded-lg bg-[#22c55e] py-2.5 text-xs font-semibold text-white hover:bg-[#2bd96c]">Approve</button>
                    <button className="flex-1 rounded-lg border border-[#29445f] py-2.5 text-xs font-medium text-[#a6b7c7] hover:border-[#4f8cff] hover:text-white">Modify</button>
                    <button className="flex-1 rounded-lg border border-[#29445f] py-2.5 text-xs font-medium text-[#a6b7c7] hover:border-red-400/50 hover:text-red-300">Reject</button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <SectionHeading eyebrow="Complete audit trail" title="Agent timeline" />
            <div className="space-y-0">
              {[
                ['Case detected', '17:12:58', `${item.type} · ${money(item.amount)} at risk`, 'slate'],
                ['AI diagnosis completed', '17:12:59', item.diagnosis, 'blue'],
                ['Recovery strategy selected', '17:13:00', `AI compared 4 strategies → picked best fit`, 'blue'],
                ['Policy checked', '17:13:01', `${item.policy} · ${item.risk === 'Critical' || item.amount > 50000 ? 'HUMAN APPROVAL REQUIRED' : 'APPROVED'}`, 'blue'],
                ['Recovery action executed', '17:13:04', item.lastAction, 'amber'],
                [isRecovered ? 'Payment successful' : 'Waiting for approval', isRecovered ? '17:16:42' : 'Now', isRecovered ? `${money(item.recovered ?? item.amount)} simulated recovery verified` : 'Next event will update this case', isRecovered ? 'green' : 'slate'],
              ].map(([title, time, detail, tone], index, arr) => (
                <div key={title as string} className="relative flex gap-3 pb-5">
                  <div className={`relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-[#0b1b2b] ${
                    tone === 'green' ? 'bg-[#22c55e]' : tone === 'blue' ? 'bg-[#4f8cff]' : tone === 'amber' ? 'bg-[#f59e0b]' : 'bg-[#6f89a4]'
                  }`} />
                  {index < arr.length - 1 && <div className="absolute left-[5px] top-3 h-full w-px bg-[#20354a]" />}
                  <div>
                    <div className="text-xs font-medium text-white">{title as string}</div>
                    <div className="mt-0.5 text-[10px] text-[#6f89a4]">{time as string}</div>
                    <div className="mt-1 text-[11px] text-[#9eb1c2]">{detail as string}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SummaryItem({ label, value, highlight }: { label: string; value: string; highlight?: 'green' | 'amber' }) {
  const color = highlight === 'green' ? 'text-[#45d879]' : highlight === 'amber' ? 'text-[#f0b44f]' : 'text-white';
  return (
    <div className="surface rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-[.12em] text-[#6f89a4]">{label}</div>
      <div className={`mt-2 text-sm font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function HistoryItem({ label, value, highlight }: { label: string; value: string; highlight?: 'green' }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[.12em] text-[#6f89a4]">{label}</div>
      <div className={`mt-1 text-xs font-semibold ${highlight === 'green' ? 'text-[#45d879]' : 'text-white'}`}>{value}</div>
    </div>
  );
}
