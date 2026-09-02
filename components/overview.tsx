'use client';

import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  AlertTriangle, ArrowRight, ArrowUpRight, Bot, Check, ChevronRight, ChevronDown, CircleDollarSign,
  Clock3, MessageSquareText, MoreHorizontal, Play, RefreshCw, ShieldCheck, Sparkles,
  TrendingUp, X, Zap, CreditCard, FileClock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  agentExecutionTimeline, aiRecommendations, casesSeed, chartData, funnel, funnelBreakdowns,
  money, moneyL, recoveryOpportunities, riskBreakdown, riskReasons, simulationSteps,
  type Case, type AIRecommendation,
} from '@/lib/recovery-data';
import { ConfidenceMeter, Kpi, SectionHeading, StatusBadge } from '@/components/recovery-ui';

const totalAtRisk = 485000;
const totalRecovered = 164000;

export function Overview({
  lastRun, onSimulation, running, onSelectCase, onNavigate,
}: {
  lastRun: { recovered: number; rate: number } | null;
  onSimulation: () => void;
  running: boolean;
  onSelectCase: (item: Case) => void;
  onNavigate: (section: string) => void;
}) {
  const [showSimModal, setShowSimModal] = useState(false);

  const handleRunRecovery = () => {
    setShowSimModal(true);
    onSimulation();
  };

  return (
    <>
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-[#6f89a4]">
            <span>MONDAY, 18 AUGUST 2026</span>
            <span className="h-1 w-1 rounded-full bg-[#4f8cff]" />
            <span>LAST SYNC 17:16:42</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-[-.04em] text-white md:text-[28px]">
            Revenue Recovery AI <span className="text-[#4f8cff]">.</span>
          </h1>
          <p className="mt-1 text-sm text-[#8da2b8]">AI-powered revenue recovery operations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate('Recovery cases')} className="flex items-center gap-2 rounded-lg border border-[#2a4662] bg-[#0d1b2a] px-3.5 py-2.5 text-xs font-medium text-[#c8d6e5] hover:border-[#4f8cff]">
            <ShieldCheck size={14} /> Review AI Actions
          </button>
          <button onClick={handleRunRecovery} disabled={running} className="flex items-center gap-2 rounded-lg bg-[#4f8cff] px-3.5 py-2.5 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(79,140,255,.2)] hover:bg-[#6099ff] disabled:opacity-60">
            <Play size={14} fill="currentColor" />{running ? 'Running...' : 'Run Recovery'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Revenue at risk" value={money(totalAtRisk)} detail="12.4% vs last period" trend="up" icon={AlertTriangle} color="amber" onClick={() => onNavigate('Recovery cases')} />
        <Kpi title="Simulated recovered" value={lastRun ? money(lastRun.recovered) : money(totalRecovered)} detail="34.0% simulated recovery rate" trend="up" icon={CircleDollarSign} color="green" onClick={() => onNavigate('Analytics')} />
        <Kpi title="Active cases" value="137" detail="18 require attention" trend="down" icon={Clock3} color="blue" onClick={() => onNavigate('Recovery cases')} />
        <Kpi title="Avg. recovery time" value="4h 18m" detail="22m faster than last week" trend="up" icon={TrendingUp} color="slate" />
      </div>

      {/* AI Command Center */}
      <div className="mb-6">
        <AICommandCenter recommendations={aiRecommendations} onReview={() => onNavigate('Recovery cases')} onSelectCase={onSelectCase} />
      </div>

      {/* Revenue at Risk Breakdown + Recovery Opportunities */}
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <RiskBreakdown onNavigate={onNavigate} />
        <RecoveryOpportunities onReview={() => onNavigate('Recovery cases')} />
      </div>

      {/* Expected → Estimated → Recovered flow */}
      <div className="mb-6">
        <RecoveryFlow />
      </div>

      {/* Charts + Clickable Funnel */}
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <div className="surface rounded-xl p-5">
          <SectionHeading
            eyebrow="Recovery performance"
            title="Revenue recovery"
            action={
              <div className="flex items-center gap-1 rounded-lg bg-[#13263a] p-1 text-[11px]">
                <button className="rounded-md bg-[#274766] px-2.5 py-1 text-white">7 days</button>
                <button className="px-2.5 py-1 text-[#7d94aa]">30 days</button>
                <button className="px-2.5 py-1 text-[#7d94aa]">90 days</button>
              </div>
            }
          />
          <div className="mb-3 flex gap-5 text-[11px] text-[#8da2b8]">
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#4f8cff]" />Revenue at risk</span>
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#22c55e]" />Recovered (simulated)</span>
          </div>
          <div className="chart-grid h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="riskFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4f8cff" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#4f8cff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="recoveredFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="transparent" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#7189a1', fontSize: 10 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#13263a', border: '1px solid #2c4a67', borderRadius: 8, color: '#fff', fontSize: 11 }} formatter={(value: number) => [`₹${value}k`, '']} />
                <Area type="monotone" dataKey="risk" stroke="#4f8cff" strokeWidth={2} fill="url(#riskFill)" />
                <Area type="monotone" dataKey="recovered" stroke="#22c55e" strokeWidth={2} fill="url(#recoveredFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <ClickableFunnel onNavigate={onNavigate} />
      </div>

      {/* AI Agent Execution Timeline + Priority Cases + Live Feed */}
      <div className="mb-6">
        <AgentExecutionTimeline onSelectCase={onSelectCase} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <PriorityCasesTable cases={casesSeed.slice(0, 5)} onSelectCase={onSelectCase} onNavigate={onNavigate} />
        <div className="space-y-4">
          <AIAgentStatus />
          <LiveActivityFeed />
        </div>
      </div>

      {/* Simulation Modal */}
      {showSimModal && (
        <SimulationModal running={running} onClose={() => setShowSimModal(false)} />
      )}
    </>
  );
}

/* ===== Simulation Modal ===== */

function SimulationModal({ running, onClose }: { running: boolean; onClose: () => void }) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    let totalLines = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    simulationSteps.forEach((step, stepIdx) => {
      step.lines.forEach((_, lineIdx) => {
        const lineGlobalIndex = totalLines + lineIdx;
        const delay = 300 + lineGlobalIndex * 250;
        timers.push(setTimeout(() => {
          setVisibleSteps(stepIdx + 1);
          setVisibleLines(lineGlobalIndex + 1);
        }, delay));
      });
      totalLines += step.lines.length;
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  let lineCounter = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-[#20354a] bg-[#0b1b2b] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#20354a] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4f8cff]/20 to-[#22c55e]/10 text-[#83adff]">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Recovery Engine</h3>
              <p className="text-[11px] text-[#7f94aa]">Simulated recovery execution</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#8198ae] hover:bg-[#13263a]"><X size={18} /></button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-5">
          {simulationSteps.map((step, stepIdx) => {
            const stepVisible = stepIdx < visibleSteps;
            if (!stepVisible) return null;
            return (
              <div key={step.phase} className="mb-4">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-[#83adff]">{step.phase}</div>
                <div className="space-y-1.5">
                  {step.lines.map((line, lineIdx) => {
                    const lineVisible = lineCounter < visibleLines;
                    lineCounter++;
                    if (!lineVisible) return null;
                    return (
                      <div key={lineIdx} className="flex items-center gap-2 text-[11px] text-[#c8d6e5] animate-[fadeIn_0.2s_ease-in]">
                        {line.status === 'warning' ? (
                          <span className="text-amber-400">⚠</span>
                        ) : (
                          <Check size={13} className="text-[#45d879]" />
                        )}
                        {line.text}
                        {line.status === 'warning' && <span className="ml-auto text-[10px] text-amber-300">Human review</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Final result */}
          {visibleLines >= simulationSteps.reduce((s, step) => s + step.lines.length, 0) && (
            <div className="mt-4 rounded-lg border border-[#214b35] bg-[#10291b] p-4 animate-[fadeIn_0.3s_ease-in]">
              <div className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#45d879]">Estimated recoverable</div>
              <div className="mt-1 text-2xl font-bold text-white">{money(174000)}</div>
              <button className="mt-3 w-full rounded-lg bg-[#22c55e] py-2.5 text-xs font-semibold text-white hover:bg-[#2bd96c]">
                Execute approved actions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== Expected → Estimated → Recovered Flow ===== */

function RecoveryFlow() {
  return (
    <div className="surface rounded-xl p-5">
      <SectionHeading eyebrow="Recovery pipeline" title="Expected → Estimated → Recovered" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-[#20354a] bg-[#091725] p-4">
          <div className="text-[10px] uppercase tracking-[.12em] text-[#6f89a4]">Potentially recoverable</div>
          <div className="mt-1 text-xl font-semibold text-white">{moneyL(231000)}</div>
          <div className="mt-1 text-[10px] text-[#7f94aa]">Eligible revenue at risk</div>
        </div>
        <div className="flex items-center justify-center">
          <ArrowRight size={20} className="text-[#5d7894] md:rotate-0 rotate-90" />
        </div>
        <div className="rounded-lg border border-[#20354a] bg-[#091725] p-4 md:col-span-1">
          <div className="text-[10px] uppercase tracking-[.12em] text-[#6f89a4]">AI estimated recovery</div>
          <div className="mt-1 text-xl font-semibold text-[#83adff]">{moneyL(174000)}</div>
          <div className="mt-1 text-[10px] text-[#7f94aa]">AI prediction based on probability</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center">
        <ArrowRight size={20} className="rotate-90 text-[#5d7894]" />
      </div>
      <div className="mt-3 rounded-lg border border-[#214b35] bg-[#10291b] p-4 text-center">
        <div className="text-[10px] uppercase tracking-[.12em] text-[#45d879]">Recovered (simulated)</div>
        <div className="mt-1 text-xl font-semibold text-[#45d879]">{moneyL(164000)}</div>
        <div className="mt-1 text-[10px] text-[#7f94aa]">Confirmed successful recovery · will be replaced by verified payment events when real integration is connected</div>
      </div>
    </div>
  );
}

/* ===== Clickable Funnel ===== */

function ClickableFunnel({ onNavigate }: { onNavigate: (section: string) => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div className="surface rounded-xl p-5">
      <SectionHeading eyebrow="Closed-loop view" title="Recovery funnel" action={<span className="text-[10px] text-[#6f89a4]">Click stages to expand</span>} />
      <div className="space-y-2">
        {funnel.map((item, index) => (
          <div key={item.label}>
            <button
              onClick={() => setExpanded(expanded === index ? null : index)}
              className="w-full text-left"
            >
              <div className="mb-1.5 flex items-center justify-between text-[11px]">
                <span className={`flex items-center gap-1.5 ${index === funnel.length - 1 ? 'font-medium text-white' : 'text-[#8da2b8]'}`}>
                  {funnelBreakdowns[index] && <ChevronDown size={11} className={`transition-transform ${expanded === index ? 'rotate-180' : ''} text-[#5d7894]`} />}
                  {item.label}
                </span>
                <span className="font-semibold text-white">{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-[#182d43]">
                <div className="h-2 rounded-full transition-all" style={{ width: item.width, background: item.color }} />
              </div>
            </button>
            {expanded === index && funnelBreakdowns[index] && (
              <div className="mt-2 space-y-1.5 rounded-lg border border-[#20354a] bg-[#091725] p-3 animate-[fadeIn_0.15s_ease-in]">
                {funnelBreakdowns[index].map((bd) => (
                  <button
                    key={bd.label}
                    onClick={() => onNavigate('Recovery cases')}
                    className="flex w-full items-center justify-between text-[11px] text-[#a9bacb] hover:text-white"
                  >
                    <span>{bd.label}</span>
                    <span className="font-semibold text-white">{bd.value}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[#20354a] pt-4 text-[11px]">
        <span className="text-[#7f94aa]">Simulated recovery rate</span>
        <span className="font-semibold text-[#45d879]">34.0% <ArrowUpRight className="inline" size={13} /></span>
      </div>
    </div>
  );
}

/* ===== Agent Execution Timeline ===== */

const agentIcons: Record<string, LucideIcon> = {
  alert: AlertTriangle, sparkles: Sparkles, trending: TrendingUp, zap: Zap,
  shield: ShieldCheck, message: MessageSquareText, check: Check, dollar: CircleDollarSign,
};

function AgentExecutionTimeline({ onSelectCase }: { onSelectCase: (item: Case) => void }) {
  return (
    <div className="surface rounded-xl p-5">
      <SectionHeading
        eyebrow="Agent workflow"
        title="AI agent execution timeline"
        action={
          <button onClick={() => onSelectCase(casesSeed[0])} className="flex items-center gap-1 text-[11px] font-medium text-[#72a2ff] hover:text-white">
            View case <ChevronRight size={13} />
          </button>
        }
      />
      <div className="flex flex-col gap-0 md:flex-row md:items-start md:gap-0">
        {agentExecutionTimeline.map((stage, index) => {
          const Icon = agentIcons[stage.icon] ?? Zap;
          return (
            <div key={stage.step} className="flex items-start gap-3 md:flex-1 md:flex-col md:items-center md:text-center">
              {/* Icon circle */}
              <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                stage.status === 'done'
                  ? 'bg-[#4f8cff]/15 text-[#83adff]'
                  : stage.status === 'active'
                  ? 'bg-amber-400/15 text-amber-300 animate-pulse'
                  : 'bg-[#182d43] text-[#5d7894]'
              }`}>
                <Icon size={18} />
                {index < agentExecutionTimeline.length - 1 && (
                  <div className="absolute left-full top-1/2 hidden h-px w-full -translate-y-1/2 bg-[#20354a] md:block" style={{ width: 'calc(100% - 20px)', left: 'calc(50% + 20px)' }} />
                )}
                {index < agentExecutionTimeline.length - 1 && (
                  <div className="absolute left-5 top-full h-full w-px bg-[#20354a] md:hidden" style={{ height: 'calc(100% - 10px)' }} />
                )}
              </div>
              {/* Text */}
              <div className="flex-1 md:mt-2 md:flex-none">
                <div className="text-[9px] font-semibold uppercase tracking-[.14em] text-[#6f89a4]">{stage.step}</div>
                <div className="mt-0.5 text-[11px] font-medium text-white">{stage.label}</div>
                <div className="mt-0.5 text-[10px] text-[#7f94aa]">{stage.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== AI Command Center ===== */

function AICommandCenter({ recommendations, onReview, onSelectCase }: { recommendations: AIRecommendation[]; onReview: () => void; onSelectCase: (item: Case) => void }) {
  return (
    <div className="surface overflow-hidden rounded-xl border-l-2 border-l-[#4f8cff]">
      <div className="border-b border-[#20354a] p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#4f8cff]/20 to-[#22c55e]/10 text-[#83adff]">
              <Bot size={22} />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-[-.02em] text-white">AI Recovery Command Center</h2>
              <div className="mt-1 flex items-center gap-2 text-[11px]">
                <span className="flex items-center gap-1.5 text-[#55d981]"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#22c55e]" />Recovery Agent Active</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onReview} className="rounded-lg border border-[#2a4662] bg-[#0d1b2a] px-3 py-2 text-[11px] font-medium text-[#c8d6e5] hover:border-[#4f8cff]">Review 18 Cases</button>
            <button className="rounded-lg bg-[#22c55e] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#2bd96c]">Approve Safe Actions</button>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-[#20354a] bg-[#091725] p-3">
          <p className="text-sm text-[#c8d6e5]">
            <span className="font-semibold text-white">18 cases</span> require immediate attention. <span className="font-semibold text-[#f0b44f]">{moneyL(142000)}</span> is currently classified as critical-risk revenue.
          </p>
        </div>
      </div>
      <div className="divide-y divide-[#20354a]">
        {recommendations.map((rec) => (
          <div key={rec.id} className="flex flex-col gap-3 p-5 hover:bg-[#0e1d2e] md:flex-row md:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#4f8cff]/15 text-[11px] font-semibold text-[#83adff]">{rec.id}</span>
                <span className="text-sm font-medium text-white">{rec.action}</span>
                {rec.requiresApproval && (
                  <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">Needs approval</span>
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-[#7f94aa]">{rec.reason}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-[11px]">
                <span className="flex items-center gap-1.5 text-[#8da2b8]">
                  <span className="text-[#6f89a4]">Cases:</span> <span className="font-medium text-white">{rec.cases}</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#8da2b8]">
                  <span className="text-[#6f89a4]">Expected recovery:</span> <span className="font-semibold text-[#45d879]">{money(rec.expectedRecovery)}</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#8da2b8]">
                  <span className="text-[#6f89a4]">Confidence:</span> <span className="font-medium text-white">{rec.confidence}%</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#8da2b8]">
                  <span className="text-[#6f89a4]">Risk:</span> <span className={rec.riskLevel === 'High' ? 'font-medium text-red-300' : rec.riskLevel === 'Medium' ? 'font-medium text-amber-300' : 'font-medium text-green-300'}>{rec.riskLevel}</span>
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onSelectCase(casesSeed[0])} className="rounded-lg border border-[#20354a] px-3 py-2 text-[11px] font-medium text-[#a6b7c7] hover:border-[#4f8cff] hover:text-white">Review</button>
              {rec.requiresApproval ? (
                <button className="rounded-lg bg-amber-500/90 px-3 py-2 text-[11px] font-semibold text-white hover:bg-amber-500">Approve</button>
              ) : (
                <button className="rounded-lg bg-[#22c55e] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#2bd96c]">Execute</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Risk Breakdown ===== */

function RiskBreakdown({ onNavigate }: { onNavigate: (section: string) => void }) {
  const total = riskBreakdown.reduce((sum, r) => sum + r.amount, 0);
  return (
    <div className="surface rounded-xl p-5">
      <SectionHeading
        eyebrow="Exposure analysis"
        title="Revenue at risk"
        action={<span className="text-[11px] text-[#f0b44f]"><ArrowUpRight className="inline" size={13} /> 12.4% vs previous period</span>}
      />
      <div className="mb-4 text-2xl font-semibold tracking-[-.03em] text-white">{moneyL(total)}</div>
      <div className="mb-4 flex h-3 w-full overflow-hidden rounded-full">
        {riskBreakdown.map((r) => (
          <button
            key={r.level}
            onClick={() => onNavigate('Recovery cases')}
            className="h-full transition-all hover:brightness-125"
            style={{ width: `${(r.amount / total) * 100}%`, background: r.color }}
            title={`${r.level}: ${money(r.amount)}`}
          />
        ))}
      </div>
      <div className="space-y-2.5">
        {riskBreakdown.map((r) => (
          <button
            key={r.level}
            onClick={() => onNavigate('Recovery cases')}
            className="flex w-full items-center justify-between rounded-lg border border-[#20354a] bg-[#091725] p-3 text-left transition-colors hover:border-[#4f8cff]/40"
          >
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ background: r.color }} />
              <span className="text-xs font-medium text-white">{r.level}</span>
              <span className="text-[11px] text-[#7f94aa]">{r.cases} cases</span>
            </div>
            <span className="text-sm font-semibold text-white">{money(r.amount)}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 border-t border-[#20354a] pt-4">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#6f89a4]">Top risk reasons</div>
        <div className="space-y-2.5">
          {riskReasons.map((r) => (
            <button
              key={r.reason}
              onClick={() => onNavigate('Recovery cases')}
              className="flex w-full items-center justify-between text-left text-[11px] hover:opacity-80"
            >
              <span className="flex items-center gap-2 text-[#a9bacb]">
                <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                {r.reason}
              </span>
              <span className="font-semibold text-white">{r.percentage}%</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== Recovery Opportunities ===== */

const opportunityIcons: Record<string, LucideIcon> = {
  'credit-card': CreditCard, 'file-clock': FileClock, 'refresh': RefreshCw, 'cart': FileClock,
};

function RecoveryOpportunities({ onReview }: { onReview: () => void }) {
  const totalPotentially = 231000;
  const totalRecoverable = 174000;
  return (
    <div className="surface rounded-xl p-5">
      <SectionHeading eyebrow="AI-identified" title="Recovery opportunities" />
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[#20354a] bg-[#091725] p-3">
          <div className="text-[10px] uppercase tracking-[.12em] text-[#6f89a4]">Potentially recoverable</div>
          <div className="mt-1 text-lg font-semibold text-white">{moneyL(totalPotentially)}</div>
        </div>
        <div className="rounded-lg border border-[#214b35] bg-[#10291b] p-3">
          <div className="text-[10px] uppercase tracking-[.12em] text-[#6f89a4]">Est. recoverable</div>
          <div className="mt-1 text-lg font-semibold text-[#45d879]">{moneyL(totalRecoverable)}</div>
        </div>
      </div>
      <div className="space-y-3">
        {recoveryOpportunities.map((opp) => {
          const Icon = opportunityIcons[opp.icon] ?? FileClock;
          return (
            <div key={opp.type} className="flex items-center justify-between rounded-lg border border-[#20354a] bg-[#091725] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a3553] text-[#78aaff]"><Icon size={15} /></div>
                <div>
                  <div className="text-xs font-medium text-white">{opp.count} {opp.type}</div>
                  <div className="text-[10px] text-[#7f94aa]">{money(opp.amount)} at risk</div>
                </div>
              </div>
              <ChevronRight size={15} className="text-[#5d7894]" />
            </div>
          );
        })}
      </div>
      <button onClick={onReview} className="mt-4 w-full rounded-lg bg-[#4f8cff] py-2.5 text-xs font-semibold text-white hover:bg-[#6099ff]">Review Opportunities</button>
    </div>
  );
}

/* ===== Priority Cases Table ===== */

function PriorityCasesTable({ cases, onSelectCase, onNavigate }: { cases: Case[]; onSelectCase: (item: Case) => void; onNavigate: (section: string) => void }) {
  return (
    <div className="surface overflow-hidden rounded-xl">
      <div className="p-5 pb-3">
        <SectionHeading
          eyebrow="Needs attention"
          title="Priority recovery cases"
          action={<button onClick={() => onNavigate('Recovery cases')} className="flex items-center gap-1 text-[11px] font-medium text-[#72a2ff] hover:text-white">View all <ChevronRight size={13} /></button>}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left">
          <thead className="border-y border-[#20354a] text-[10px] uppercase tracking-[.12em] text-[#647d96]">
            <tr>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Risk</th>
              <th className="px-3 py-3 font-medium">Amount</th>
              <th className="px-3 py-3 font-medium">Recovery Prob.</th>
              <th className="px-3 py-3 font-medium">Next Best Action</th>
              <th className="px-3 py-3 font-medium">Owner</th>
              <th className="px-3 py-3 font-medium">Deadline</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {cases.map((item) => (
              <tr key={item.id} onClick={() => onSelectCase(item)} className="data-row cursor-pointer border-b border-[#20354a]/70">
                <td className="px-5 py-3.5">
                  <div className="font-medium text-white">{item.customer}</div>
                  <div className="text-[10px] text-[#7189a1]">{item.ref}</div>
                </td>
                <td className="px-3 py-3.5"><RiskBadgeMini risk={item.risk} /></td>
                <td className="px-3 py-3.5 text-xs font-semibold text-white">{money(item.amount)}</td>
                <td className="px-3 py-3.5"><ConfidenceMeter value={item.probability} /></td>
                <td className="max-w-[180px] px-3 py-3.5 text-[11px] text-[#a1b2c4]">{item.nextAction}</td>
                <td className="px-3 py-3.5 text-[11px] text-[#9bb0c4]">{item.owner}</td>
                <td className="px-3 py-3.5 text-[11px] text-[#f0b44f]">{item.deadline}</td>
                <td className="px-3 py-3.5"><StatusBadge status={item.status} /></td>
                <td className="px-5 py-3.5 text-right"><ChevronRight size={15} className="text-[#5d7894]" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RiskBadgeMini({ risk }: { risk: string }) {
  const style =
    risk === 'Critical' ? 'text-red-300 bg-red-400/10'
    : risk === 'High' ? 'text-amber-300 bg-amber-400/10'
    : risk === 'Low' ? 'text-green-300 bg-green-400/10'
    : 'text-slate-300 bg-slate-400/10';
  return <span className={`rounded-md px-2 py-1 text-[11px] ${style}`}>{risk}</span>;
}

/* ===== AI Agent Status ===== */

function AIAgentStatus() {
  return (
    <div className="surface rounded-xl p-5">
      <SectionHeading eyebrow="AI Agent" title="Agent status" action={<span className="flex items-center gap-1.5 text-[10px] text-[#55d981]"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#22c55e]" />ACTIVE</span>} />
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4f8cff]/20 to-[#22c55e]/10 text-[#83adff]">
          <Bot size={24} />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Monitoring 842 recovery cases</div>
          <div className="text-[11px] text-[#7f94aa]">Currently working on Sarah Wilson · ₹84,200 at risk</div>
        </div>
      </div>
      <div className="space-y-3 rounded-lg border border-[#20354a] bg-[#091725] p-3 text-[11px]">
        <div className="flex justify-between"><span className="text-[#7f94aa]">Diagnosing</span><span className="text-white">Invoice overdue → payment history → customer behavior</span></div>
        <div className="flex justify-between"><span className="text-[#7f94aa]">Next action</span><span className="text-white">Send escalation message</span></div>
        <div className="flex justify-between"><span className="text-[#7f94aa]">Confidence</span><span className="font-semibold text-[#45d879]">94%</span></div>
        <div className="flex justify-between"><span className="text-[#7f94aa]">Policy</span><span className="font-mono text-[#94b6dc]">COLLECTIONS_ESCALATION_02</span></div>
      </div>
    </div>
  );
}

/* ===== Live Activity Feed ===== */

function LiveActivityFeed() {
  const items: [string, string, string, 'green' | 'blue' | 'amber' | 'slate', LucideIcon][] = [
    ['17:16:42', 'Payment successful', '₹12,499 simulated recovery · REC_10021', 'green', Check],
    ['17:16:38', 'Policy check approved', 'PAYMENT_RECOVERY_01 · automated action', 'blue', ShieldCheck],
    ['17:13:04', 'Payment update request sent', 'WhatsApp · Rahul Sharma', 'slate', MessageSquareText],
    ['17:12:59', 'Agent diagnosed expired card', 'CUS_1024 · medium risk', 'amber', Sparkles],
  ];
  return (
    <div className="surface rounded-xl p-5">
      <SectionHeading eyebrow="Live agent activity" title="What's happening now" action={<span className="flex items-center gap-1.5 text-[10px] text-[#55d981]"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#22c55e]" />LIVE</span>} />
      <div className="space-y-5">
        {items.map(([time, title, detail, tone, Icon]) => (
          <div key={time} className="flex gap-3">
            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${tone === 'green' ? 'bg-green-400/10 text-green-400' : tone === 'blue' ? 'bg-blue-400/10 text-blue-300' : tone === 'amber' ? 'bg-amber-400/10 text-amber-300' : 'bg-slate-400/10 text-slate-300'}`}>
              <Icon size={14} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-medium text-white">
                <span>{title}</span>
                <span className="text-[10px] font-normal text-[#617b94]">{time}</span>
              </div>
              <div className="mt-0.5 truncate text-[11px] text-[#7f94aa]">{detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
