'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowDownRight, Bell, Bot, Boxes, BriefcaseBusiness, Check, ChevronRight,
  CircleDollarSign, Clock3, CreditCard, Database, FileClock, GitBranch, Headphones,
  LayoutDashboard, LifeBuoy, Menu, MessageSquareText, MoreHorizontal, Play, Plus,
  RefreshCw, Settings, ShieldCheck, Sparkles, Users, Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { money, type Case } from '@/lib/recovery-data';
import { Kpi, PageTitle, RiskBadge, SectionHeading, StatusBadge, Toggle } from '@/components/recovery-ui';
import { Overview } from '@/components/overview';
import { CasesView } from '@/components/cases-view';
import { CaseDrawer } from '@/components/case-drawer';
import { CustomersView } from '@/components/customers-view';
import { AnalyticsView } from '@/components/analytics-view';
import { SettingsView, PoliciesView } from '@/components/settings-view';
import { AICommandBar } from '@/components/ai-command-bar';

type NavItem = { label: string; icon: LucideIcon; section?: string };

const navItems: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Recovery cases', icon: BriefcaseBusiness },
  { label: 'Customers', icon: Users },
  { label: 'Invoices', icon: FileClock },
  { label: 'Subscriptions', icon: CreditCard },
  { label: 'Automations', icon: Zap, section: 'OPERATE' },
  { label: 'Playbooks', icon: GitBranch },
  { label: 'Policies', icon: ShieldCheck },
  { label: 'Agent activity', icon: Bot, section: 'OBSERVE' },
  { label: 'Audit logs', icon: Database },
  { label: 'Analytics', icon: Activity },
  { label: 'Integrations', icon: Boxes, section: 'CONFIGURE' },
  { label: 'Settings', icon: Settings },
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="brand-mark flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_0_20px_rgba(79,140,255,.18)]">
        <Image src="/images/WhatsApp_Image_2026-08-22_at_6.45.18_PM.jpeg" alt="Revenue Recovery Agent logo" width={40} height={40} className="h-full w-full object-cover" />
      </div>
      <div className="brand-copy leading-tight">
        <div className="font-semibold tracking-[-.02em] text-white">Revenue Recovery</div>
        <div className="text-[10px] font-medium uppercase tracking-[.18em] text-[#22c55e]">AI operations</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [active, setActive] = useState('Overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<{ recovered: number; rate: number } | null>(null);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'Failed payment recovery': true, 'Checkout abandonment': true,
    'Overdue invoice chaser': true, 'Promise-to-pay follow-up': true, 'Mandate retry sequencer': false,
  });
  const [externalFilter, setExternalFilter] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.from('recovery_runs').select('recovered_amount, recovery_rate').order('completed_at', { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
      if (mounted && data) setLastRun({ recovered: Number(data.recovered_amount), rate: Number(data.recovery_rate) });
    });
    return () => { mounted = false; };
  }, []);

  const runSimulation = async () => {
    setRunning(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    const result = { recovered: 164000, rate: 34 };
    setLastRun(result);
    await supabase.from('recovery_runs').insert({
      mode: 'sandbox', events_detected: 100, eligible_events: 72,
      follow_up_events: 18, escalated_events: 10,
      recovered_amount: result.recovered, recovery_rate: result.rate,
    });
    setRunning(false);
  };

  const navigateTo = (section: string, filter?: string | null) => {
    setActive(section);
    setExternalFilter(filter ?? null);
    setMobileOpen(false);
  };

  const renderContent = () => {
    if (active === 'Recovery cases') return <CasesView onSelect={setSelectedCase} externalFilter={externalFilter} />;
    if (active === 'Customers') return <CustomersView />;
    if (active === 'Invoices') return <InvoicesView />;
    if (active === 'Subscriptions') return <SubscriptionsView />;
    if (active === 'Automations') return <AutomationView toggles={toggles} setToggles={setToggles} />;
    if (active === 'Playbooks') return <PlaybooksView />;
    if (active === 'Policies') return <PoliciesView />;
    if (active === 'Agent activity') return <ActivityView />;
    if (active === 'Audit logs') return <AuditLogsView />;
    if (active === 'Analytics') return <AnalyticsView />;
    if (active === 'Integrations') return <IntegrationsView />;
    if (active === 'Settings') return <SettingsView />;
    return <Overview lastRun={lastRun} onSimulation={runSimulation} running={running} onSelectCase={setSelectedCase} onNavigate={(s) => navigateTo(s)} />;
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''} fixed bottom-0 left-0 top-0 z-20 flex w-[248px] flex-col px-3 py-5`}>
        <div className="mb-8 px-3"><Logo /></div>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.label}>
              {item.section && <div className="mb-2 mt-6 px-3 text-[10px] font-semibold tracking-[.18em] text-[#58718c]">{item.section}</div>}
              <button
                onClick={() => navigateTo(item.label)}
                className={`nav-button flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] ${active === item.label ? 'active' : ''}`}
              >
                <item.icon size={16} strokeWidth={1.8} />
                <span className="sidebar-label">{item.label}</span>
                {item.label === 'Recovery cases' && <span className="sidebar-label ml-auto rounded-full bg-[#4f8cff]/15 px-1.5 py-0.5 text-[10px] text-[#83adff]">137</span>}
              </button>
            </div>
          ))}
        </nav>
        <div className="surface rounded-xl p-3">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-white">
            <span className="pulse-dot h-2 w-2 rounded-full bg-amber-400" /> Sandbox mode
          </div>
          <p className="sidebar-label text-[11px] leading-4 text-[#7f94aa]">No real customer communication or payments will occur. All actions are simulated.</p>
          <button onClick={runSimulation} disabled={running} className="sidebar-label mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#19314a] py-2 text-[11px] font-medium text-[#bcd0e5] hover:bg-[#23415f] disabled:opacity-60">
            <Play size={12} />{running ? 'Running...' : 'Run simulation'}
          </button>
        </div>
      </aside>

      {mobileOpen && <button aria-label="Close menu" className="mobile-overlay fixed inset-0 z-10 hidden bg-black/50" onClick={() => setMobileOpen(false)} />}

      <main className="content ml-[248px] min-h-screen">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-[#20354a]/80 bg-[#07111f]/85 px-5 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-3">
            <button aria-label="Open navigation" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-[#8da2b8] hover:bg-[#13263a] lg:hidden">
              <Menu size={19} />
            </button>
            <AICommandBar onNavigate={(s) => navigateTo(s)} />
            <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Sandbox
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-[11px] text-[#7f94aa] md:block">Last synced 17:16:42</span>
            <button aria-label="Refresh" className="text-[#8da2b8] hover:text-white"><RefreshCw size={17} /></button>
            <button aria-label="Notifications" className="relative text-[#8da2b8] hover:text-white">
              <Bell size={18} /><span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#ef4444]" />
            </button>
            <div className="hidden h-5 w-px bg-[#20354a] sm:block" />
            <button className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#244b7a] text-xs font-semibold text-white">AK</div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-medium text-white">Aarav Kapoor</div>
                <div className="text-[10px] text-[#7f94aa]">Finance manager</div>
              </div>
              <ChevronRight className="hidden rotate-90 text-[#6d8399] sm:block" size={14} />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-8">
          {renderContent()}
        </div>
      </main>

      {selectedCase && <CaseDrawer item={selectedCase} onClose={() => setSelectedCase(null)} />}
    </div>
  );
}

/* ===== Remaining inline views (unchanged functionality) ===== */

function InvoicesView() {
  const invoices: [string, string, string, number, string, number, string, string, string][] = [
    ['INV_2048', 'Sarah Wilson', 'CUS_0998', 84200, '18 Jul 2026', 31, 'Overdue', 'Critical', 'Recovery Active'],
    ['INV_2047', 'Nisha Kapoor', 'CUS_1004', 45800, '15 Jul 2026', 34, 'Overdue', 'High', 'Recovery Active'],
    ['INV_2046', 'Arjun Patel', 'CUS_1011', 24999, '12 Aug 2026', 6, 'Due', 'Medium', '—'],
    ['INV_2045', 'Rahul Sharma', 'CUS_1024', 12499, '10 Aug 2026', 0, 'Paid', 'Low', 'Recovered'],
    ['INV_2044', 'Michael Chen', 'CUS_0976', 15200, '05 Aug 2026', 17, 'Overdue', 'Medium', 'Escalated'],
    ['INV_2043', 'Priya Mehta', 'CUS_1042', 6890, '14 Aug 2026', 4, 'Due', 'Low', '—'],
  ];
  return (
    <>
      <PageTitle title="Invoices" description="Track overdue invoices and their recovery status." action={<button className="flex items-center gap-2 rounded-lg bg-[#4f8cff] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#6099ff]"><Plus size={14} />Create invoice</button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Total outstanding" value="₹4,85,000" detail="Across 42 invoices" trend="up" icon={FileClock} color="amber" />
        <Kpi title="Overdue" value="18" detail="₹3,12,000 at risk" trend="down" icon={AlertTriangle} color="red" />
        <Kpi title="Recovered" value="₹1,64,000" detail="34% recovery rate" trend="up" icon={CircleDollarSign} color="green" />
        <Kpi title="Avg. days overdue" value="12 days" detail="3 days better" trend="up" icon={Clock3} color="blue" />
      </div>
      <div className="mt-4 surface overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead className="border-b border-[#20354a] text-[10px] uppercase tracking-[.12em] text-[#647d96]">
              <tr>{['Invoice', 'Customer', 'Amount', 'Due date', 'Days overdue', 'Status', 'Risk', 'Recovery', ''].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {invoices.map(([inv, customer, ref, amount, due, days, status, risk, recovery]) => (
                <tr key={inv} className="data-row cursor-pointer border-b border-[#20354a]/70">
                  <td className="px-5 py-4"><div className="font-mono text-xs font-medium text-white">{inv}</div><div className="text-[10px] text-[#7189a1]">{customer} · {ref}</div></td>
                  <td className="px-5 py-4 text-xs text-[#a9bacb]">{customer}</td>
                  <td className="px-5 py-4 text-xs font-semibold text-white">{money(amount)}</td>
                  <td className="px-5 py-4 text-xs text-[#9bb0c4]">{due}</td>
                  <td className="px-5 py-4 text-xs text-[#f0b44f]">{days}d</td>
                  <td className="px-5 py-4"><span className={`rounded-md px-2 py-1 text-[11px] ${status === 'Paid' ? 'text-green-300 bg-green-400/10' : status === 'Overdue' ? 'text-red-300 bg-red-400/10' : 'text-slate-300 bg-slate-400/10'}`}>{status}</span></td>
                  <td className="px-5 py-4"><RiskBadge risk={risk} /></td>
                  <td className="px-5 py-4 text-xs text-[#9bb0c4]">{recovery}</td>
                  <td className="px-5 py-4 text-right"><ChevronRight size={15} className="text-[#5d7894]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function SubscriptionsView() {
  const subs: [string, string, string, string, number, string, string, string, string][] = [
    ['SUB_501', 'Rahul Sharma', 'CUS_1024', 'Growth plan', 12499, '18 Sep 2026', 'Active', '—', 'Recovered'],
    ['SUB_502', 'Arjun Patel', 'CUS_1011', 'Growth plan', 24999, '22 Aug 2026', 'Payment failed', 'Insufficient funds', 'Recovery in Progress'],
    ['SUB_503', 'Priya Mehta', 'CUS_1042', 'Starter', 4999, '25 Aug 2026', 'Active', '—', '—'],
    ['SUB_504', 'Sarah Wilson', 'CUS_0998', 'Enterprise', 49999, '01 Sep 2026', 'Active', '—', '—'],
    ['SUB_505', 'Michael Chen', 'CUS_0976', 'Starter', 7999, '20 Aug 2026', 'Payment failed', 'Bank decline', 'Escalated'],
    ['SUB_506', 'Nisha Kapoor', 'CUS_1004', 'Enterprise', 49999, '28 Aug 2026', 'Active', '—', '—'],
  ];
  return (
    <>
      <PageTitle title="Subscriptions" description="Monitor subscription health and failed payment recovery." action={<button className="flex items-center gap-2 rounded-lg bg-[#4f8cff] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#6099ff]"><Plus size={14} />Add subscription</button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Active subscriptions" value="1,068" detail="₹42.8L MRR" trend="up" icon={CreditCard} color="blue" />
        <Kpi title="Payment failed" value="42" detail="₹4.2L at risk" trend="down" icon={AlertTriangle} color="red" />
        <Kpi title="Recovered this month" value="28" detail="66.7% recovery rate" trend="up" icon={Check} color="green" />
        <Kpi title="Churned" value="12" detail="2.1% churn rate" trend="down" icon={ArrowDownRight} color="amber" />
      </div>
      <div className="mt-4 surface overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead className="border-b border-[#20354a] text-[10px] uppercase tracking-[.12em] text-[#647d96]">
              <tr>{['Subscription', 'Customer', 'Plan', 'MRR', 'Renewal', 'Payment status', 'Failure reason', 'Recovery', ''].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {subs.map(([sub, customer, ref, plan, mrr, renewal, payStatus, reason, recovery]) => (
                <tr key={sub} className="data-row cursor-pointer border-b border-[#20354a]/70">
                  <td className="px-5 py-4"><div className="font-mono text-xs font-medium text-white">{sub}</div><div className="text-[10px] text-[#7189a1]">{customer} · {ref}</div></td>
                  <td className="px-5 py-4 text-xs text-[#a9bacb]">{customer}</td>
                  <td className="px-5 py-4 text-xs text-[#9bb0c4]">{plan}</td>
                  <td className="px-5 py-4 text-xs font-semibold text-white">{money(mrr)}/mo</td>
                  <td className="px-5 py-4 text-xs text-[#9bb0c4]">{renewal}</td>
                  <td className="px-5 py-4"><span className={`rounded-md px-2 py-1 text-[11px] ${payStatus === 'Active' ? 'text-green-300 bg-green-400/10' : 'text-red-300 bg-red-400/10'}`}>{payStatus}</span></td>
                  <td className="px-5 py-4 text-xs text-[#a1b2c4]">{reason}</td>
                  <td className="px-5 py-4 text-xs text-[#9bb0c4]">{recovery}</td>
                  <td className="px-5 py-4 text-right"><ChevronRight size={15} className="text-[#5d7894]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function AutomationView({ toggles, setToggles }: { toggles: Record<string, boolean>; setToggles: React.Dispatch<React.SetStateAction<Record<string, boolean>>> }) {
  const cards = [
    { name: 'Failed payment recovery', icon: CreditCard, trigger: 'payment_failed', actions: 'Diagnose → message → retry', rate: '68.4%', runs: '1,248' },
    { name: 'Checkout abandonment', icon: BriefcaseBusiness, trigger: 'checkout_abandoned', actions: 'Wait 2h → personalized reminder', rate: '22.1%', runs: '684' },
    { name: 'Overdue invoice chaser', icon: FileClock, trigger: 'invoice_overdue', actions: 'Reminder → collections → escalate', rate: '41.8%', runs: '392' },
    { name: 'Promise-to-pay follow-up', icon: MessageSquareText, trigger: 'promise_to_pay_missed', actions: 'Follow-up → assign owner', rate: '58.2%', runs: '174' },
    { name: 'Mandate retry sequencer', icon: RefreshCw, trigger: 'mandate_failed', actions: 'Retry → request authorization', rate: '31.6%', runs: '88' },
  ];
  return (
    <>
      <PageTitle title="Automations" description="Policy-controlled workflows that close the loop on revenue risk." action={<button className="flex items-center gap-2 rounded-lg bg-[#4f8cff] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#6099ff]"><Plus size={14} />New automation</button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.name} className="surface rounded-xl p-5">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a3553] text-[#78aaff]"><card.icon size={19} /></div>
              <Toggle on={toggles[card.name]} onToggle={() => setToggles((state) => ({ ...state, [card.name]: !state[card.name] }))} label={card.name} />
            </div>
            <h3 className="font-semibold text-white">{card.name}</h3>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-[#7f94aa]">
              <span className={toggles[card.name] ? 'text-[#45d879]' : 'text-[#8296ab]'}>{toggles[card.name] ? 'ACTIVE' : 'PAUSED'}</span>
              <span>·</span><span>{card.trigger}</span>
            </div>
            <div className="my-5 rounded-lg border border-[#20354a] bg-[#091725] p-3 text-[11px] text-[#a6b7c7]">
              <div className="mb-2 text-[10px] uppercase tracking-[.14em] text-[#607b95]">Workflow</div>{card.actions}
            </div>
            <div className="flex items-end justify-between border-t border-[#20354a] pt-4">
              <div><div className="text-lg font-semibold text-white">{card.rate}</div><div className="text-[10px] text-[#7189a1]">success rate · {card.runs} runs</div></div>
              <button className="text-xs text-[#77a7ff] hover:text-white">Configure <ChevronRight className="inline" size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PlaybooksView() {
  return (
    <>
      <PageTitle title="Playbooks" description="Approved recovery recipes your agent can safely execute." action={<button className="flex items-center gap-2 rounded-lg bg-[#4f8cff] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#6099ff]"><Plus size={14} />Build playbook</button>} />
      <div className="surface rounded-xl p-5">
        <div className="mb-6 flex items-center justify-between">
          <div><div className="text-xs font-semibold text-white">Expired card recovery</div><div className="mt-1 text-[11px] text-[#7f94aa]">Used by Failed payment recovery · updated 2 days ago</div></div>
          <StatusBadge status="Recovered" />
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <WorkflowNode label="Trigger" value="Payment failed" icon={Zap} />
          <ChevronRight className="hidden text-[#52708e] md:block" size={16} />
          <WorkflowNode label="Diagnose" value="Expired card" icon={Sparkles} />
          <ChevronRight className="hidden text-[#52708e] md:block" size={16} />
          <WorkflowNode label="Policy check" value="Approved" icon={ShieldCheck} />
          <ChevronRight className="hidden text-[#52708e] md:block" size={16} />
          <WorkflowNode label="Execute" value="Update request" icon={MessageSquareText} />
          <ChevronRight className="hidden text-[#52708e] md:block" size={16} />
          <WorkflowNode label="Verify" value="Payment success" icon={Check} />
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="surface rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold text-white">Delayed retry</h3><p className="text-[11px] text-[#7f94aa]">Temporary decline recovery</p></div><span className="text-[11px] text-[#45d879]">ACTIVE</span></div>
          <div className="flex gap-2 text-[11px] text-[#9cb0c3]"><span className="rounded bg-[#13263a] px-2 py-1">Wait 24h</span><span>→</span><span className="rounded bg-[#13263a] px-2 py-1">Retry once</span><span>→</span><span className="rounded bg-[#13263a] px-2 py-1">Escalate</span></div>
        </div>
        <div className="surface rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold text-white">Collections escalation</h3><p className="text-[11px] text-[#7f94aa]">30+ days overdue</p></div><span className="text-[11px] text-[#45d879]">ACTIVE</span></div>
          <div className="flex gap-2 text-[11px] text-[#9cb0c3]"><span className="rounded bg-[#13263a] px-2 py-1">Notify owner</span><span>→</span><span className="rounded bg-[#13263a] px-2 py-1">Human review</span></div>
        </div>
      </div>
    </>
  );
}

function WorkflowNode({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-lg border border-[#20354a] bg-[#091725] p-3">
      <Icon size={15} className="text-[#70a3ff]" />
      <div><div className="text-[9px] uppercase tracking-[.12em] text-[#607b95]">{label}</div><div className="mt-0.5 text-[11px] font-medium text-white">{value}</div></div>
    </div>
  );
}

function ActivityView() {
  const items: [string, string, string, string, LucideIcon, 'green' | 'blue' | 'slate'][] = [
    ['AI DIAGNOSIS', 'REC_10021', 'Expired card detected', 'Confidence 96%', Sparkles, 'blue'],
    ['POLICY CHECK', 'PAYMENT_RECOVERY_01', 'Approved', 'Automated action permitted', ShieldCheck, 'green'],
    ['ACTION', 'REC_10021', 'WhatsApp payment update sent', 'Channel: WhatsApp', MessageSquareText, 'slate'],
    ['VERIFICATION', 'PAY_EVT_8802', 'Payment received', 'Provider confirmed success', Check, 'green'],
    ['RECOVERY', 'REC_10021', '₹12,499 recovered', 'Case automatically closed', CircleDollarSign, 'green'],
  ];
  return (
    <>
      <PageTitle title="Agent activity" description="A live, explainable feed of every diagnosis, policy decision, and action." action={<div className="flex items-center gap-2 rounded-lg border border-[#214b35] bg-[#10291b] px-3 py-2 text-[11px] text-[#59df86]"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#22c55e]" />Live feed</div>} />
      <div className="surface rounded-xl p-5">
        <div className="mb-5 flex gap-2">
          <button className="rounded-lg bg-[#274766] px-3 py-2 text-[11px] text-white">All events</button>
          {['Diagnosis', 'Policy', 'Action', 'Recovery', 'Escalation'].map((x) => <button key={x} className="rounded-lg px-3 py-2 text-[11px] text-[#7f94aa] hover:bg-[#13263a]">{x}</button>)}
        </div>
        <div className="divide-y divide-[#20354a]">
          {items.map(([type, ref, title, detail, Icon, tone], index) => (
            <div key={ref} className="flex gap-4 py-5 first:pt-2">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone === 'green' ? 'bg-green-400/10 text-green-400' : tone === 'blue' ? 'bg-blue-400/10 text-blue-300' : 'bg-slate-400/10 text-slate-300'}`}><Icon size={16} /></div>
              <div className="flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold tracking-[.12em] text-[#6f89a4]">{type}</span>
                  <span className="rounded bg-[#13263a] px-1.5 py-0.5 font-mono text-[10px] text-[#94b6dc]">{ref}</span>
                  <span className="ml-auto text-[10px] text-[#617b94]">{index + 1}m ago</span>
                </div>
                <div className="text-sm font-medium text-white">{title}</div>
                <div className="mt-1 text-[11px] text-[#7f94aa]">{detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AuditLogsView() {
  const logs: [string, string, string, string, string, string, 'green' | 'blue' | 'amber' | 'red' | 'slate'][] = [
    ['17:16:47', 'REC_10021', 'Rahul Sharma', 'Case closed', 'Payment verified · ₹12,499 recovered', 'System agent', 'green'],
    ['17:16:42', 'REC_10021', 'Rahul Sharma', 'Payment verified', 'PAY_EVT_8802 · provider confirmed success', 'Payment provider', 'green'],
    ['17:13:04', 'REC_10021', 'Rahul Sharma', 'Action executed', 'WhatsApp payment update request sent', 'Recovery agent', 'slate'],
    ['17:13:00', 'REC_10021', 'Rahul Sharma', 'Policy evaluated', 'PAYMENT_RECOVERY_01 · APPROVED', 'Policy engine', 'blue'],
    ['17:12:59', 'REC_10021', 'Rahul Sharma', 'AI diagnosis', 'Expired card · confidence 96%', 'AI agent', 'blue'],
    ['17:12:58', 'REC_10021', 'Rahul Sharma', 'Case created', 'subscription_payment_failed · ₹12,499 at risk', 'Webhook handler', 'amber'],
    ['16:48:12', 'REC_10020', 'Sarah Wilson', 'Escalated to human', 'High-value invoice · 31 days overdue', 'Policy engine', 'red'],
    ['16:20:33', 'REC_10019', 'Priya Mehta', 'Action executed', 'WhatsApp checkout reminder sent', 'Recovery agent', 'slate'],
  ];
  return (
    <>
      <PageTitle title="Audit logs" description="Every decision, action, and outcome — permanently recorded." action={<button className="flex items-center gap-2 rounded-lg border border-[#2a4662] px-3.5 py-2.5 text-xs text-[#c8d6e5] hover:border-[#4f8cff]"><ArrowDownRight size={14} />Export logs</button>} />
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#214b35] bg-[#10291b] p-4">
        <Database className="text-[#45d879]" size={20} />
        <div><div className="text-xs font-semibold text-white">Audit trail is immutable</div><div className="mt-0.5 text-[11px] text-[#8fcaa3]">Records cannot be edited or deleted through the application UI.</div></div>
      </div>
      <div className="surface overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-[#20354a] text-[10px] uppercase tracking-[.12em] text-[#647d96]">
              <tr>{['Time', 'Case', 'Customer', 'Event', 'Detail', 'Actor', ''].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {logs.map(([time, caseId, customer, event, detail, actor, tone], index) => (
                <tr key={`${caseId}-${index}`} className="data-row border-b border-[#20354a]/70">
                  <td className="px-5 py-4 font-mono text-[11px] text-[#7189a1]">{time}</td>
                  <td className="px-5 py-4 font-mono text-xs text-[#94b6dc]">{caseId}</td>
                  <td className="px-5 py-4 text-xs text-[#b1c0d0]">{customer}</td>
                  <td className="px-5 py-4"><span className={`rounded-md px-2 py-1 text-[11px] ${tone === 'green' ? 'text-green-300 bg-green-400/10' : tone === 'blue' ? 'text-blue-300 bg-blue-400/10' : tone === 'amber' ? 'text-amber-300 bg-amber-400/10' : tone === 'red' ? 'text-red-300 bg-red-400/10' : 'text-slate-300 bg-slate-400/10'}`}>{event}</span></td>
                  <td className="max-w-[280px] px-5 py-4 text-xs text-[#a1b2c4]">{detail}</td>
                  <td className="px-5 py-4 text-xs text-[#9bb0c4]">{actor}</td>
                  <td className="px-5 py-4 text-right"><MoreHorizontal size={15} className="text-[#6e869d]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function IntegrationsView() {
  const integrations: [string, string, string, LucideIcon, 'green' | 'blue' | 'slate'][] = [
    ['Stripe', 'Connected', 'Last event 2m ago', CreditCard, 'blue'],
    ['Razorpay', 'Connected', 'Last event 8m ago', CircleDollarSign, 'green'],
    ['WhatsApp', 'Connected', 'Last message 1m ago', MessageSquareText, 'green'],
    ['Email', 'Connected', 'Last message 3m ago', Headphones, 'blue'],
    ['SMS provider', 'Disconnected', 'Needs configuration', LifeBuoy, 'slate'],
    ['Webhooks', 'Healthy', '12,842 events processed', Zap, 'green'],
  ];
  return (
    <>
      <PageTitle title="Integrations" description="Connect the systems that power your recovery operations." action={<button className="flex items-center gap-2 rounded-lg bg-[#4f8cff] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#6099ff]"><Plus size={14} />Add integration</button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map(([name, status, detail, Icon, tone]) => (
          <div key={name} className="surface rounded-xl p-5">
            <div className="mb-5 flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone === 'green' ? 'bg-green-400/10 text-green-400' : tone === 'blue' ? 'bg-blue-400/10 text-blue-300' : 'bg-slate-400/10 text-slate-300'}`}><Icon size={19} /></div>
              <MoreHorizontal size={17} className="text-[#668097]" />
            </div>
            <h3 className="font-semibold text-white">{name}</h3>
            <div className="mt-1 flex items-center gap-2 text-[11px]">
              <span className={status === 'Connected' || status === 'Healthy' ? 'text-[#45d879]' : 'text-[#8da2b8]'}>{status}</span>
              <span className="text-[#516c87]">·</span><span className="text-[#7f94aa]">{detail}</span>
            </div>
            <button className="mt-5 w-full rounded-lg border border-[#20354a] py-2 text-[11px] font-medium text-[#a6b7c7] hover:border-[#4f8cff] hover:text-white">{status === 'Disconnected' ? 'Configure' : 'Manage connection'}</button>
          </div>
        ))}
      </div>
    </>
  );
}
