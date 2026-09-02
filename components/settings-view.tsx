'use client';

import { useState } from 'react';
import { Bot, Check, ChevronRight, Database, MoreHorizontal, Plus, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { autonomyLevels } from '@/lib/recovery-data';
import { PageTitle, SectionHeading, Toggle } from '@/components/recovery-ui';

export function SettingsView() {
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifWhatsApp, setNotifWhatsApp] = useState(true);
  const [notifEscalation, setNotifEscalation] = useState(true);
  const [autoRecovery, setAutoRecovery] = useState(true);
  const [maxRetries, setMaxRetries] = useState(2);
  const [autonomyLevel, setAutonomyLevel] = useState(2);

  return (
    <>
      <PageTitle title="Settings" description="Configure your recovery workspace, AI autonomy, and safety rules." />

      {/* AI Autonomy Levels */}
      <div className="mb-4 surface rounded-xl p-5">
        <SectionHeading eyebrow="AI Control" title="AI Autonomy" action={
          <span className="rounded-full bg-[#4f8cff]/15 px-2.5 py-1 text-[10px] font-medium text-[#83adff]">
            Current: Level {autonomyLevel} — {autonomyLevels[autonomyLevel - 1].name}
          </span>
        } />
        <div className="grid gap-3 md:grid-cols-3">
          {autonomyLevels.map((level) => (
            <button
              key={level.level}
              onClick={() => setAutonomyLevel(level.level)}
              className={`rounded-xl border p-4 text-left transition-all ${
                autonomyLevel === level.level
                  ? 'border-[#4f8cff] bg-[#4f8cff]/5'
                  : 'border-[#20354a] bg-[#091725] hover:border-[#4f8cff]/40'
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${level.color}20`, color: level.color }}>
                  <Bot size={18} />
                </span>
                {autonomyLevel === level.level && <Check size={16} className="text-[#4f8cff]" />}
              </div>
              <div className="text-xs font-semibold text-white">Level {level.level}</div>
              <div className="text-[11px] font-medium text-[#83adff]">{level.name}</div>
              <p className="mt-2 text-[11px] leading-relaxed text-[#7f94aa]">{level.description}</p>
              <div className="mt-3 border-t border-[#20354a] pt-3 text-[10px] text-[#9eb1c2]">
                <span className="text-[#6f89a4]">Allowed: </span>{level.allowedActions}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-[#214b35] bg-[#10291b] p-3 text-[11px] text-[#8fcaa3]">
          <ShieldCheck size={14} className="mr-1.5 inline text-[#45d879]" />
          High-risk financial actions always require human approval unless explicitly configured.
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Workspace Profile */}
        <div className="surface rounded-xl p-5">
          <SectionHeading eyebrow="Organization" title="Workspace profile" />
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] text-[#8da2b8]">Organization name</label>
              <input defaultValue="Acme SaaS Pvt Ltd" className="w-full rounded-lg border border-[#20354a] bg-[#091725] px-3 py-2.5 text-xs text-white outline-none focus:border-[#4f8cff]" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] text-[#8da2b8]">Primary currency</label>
              <div className="flex gap-2">
                {['INR', 'USD', 'EUR'].map((c) => (
                  <button key={c} className={`rounded-lg border px-3 py-2 text-xs ${c === 'INR' ? 'border-[#4f8cff] bg-[#4f8cff]/10 text-white' : 'border-[#20354a] text-[#9cb0c3]'}`}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] text-[#8da2b8]">Default language</label>
              <div className="flex gap-2">
                {['English', 'Hinglish', 'Hindi'].map((l) => (
                  <button key={l} className={`rounded-lg border px-3 py-2 text-xs ${l === 'English' ? 'border-[#4f8cff] bg-[#4f8cff]/10 text-white' : 'border-[#20354a] text-[#9cb0c3]'}`}>{l}</button>
                ))}
              </div>
            </div>
          </div>
          <button className="mt-5 w-full rounded-lg bg-[#4f8cff] py-2.5 text-xs font-semibold text-white hover:bg-[#6099ff]">Save changes</button>
        </div>

        {/* Recovery Rules */}
        <div className="surface rounded-xl p-5">
          <SectionHeading eyebrow="Safety" title="Recovery rules" />
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white">Automated recovery</div>
                <div className="mt-0.5 text-[11px] text-[#7f94aa]">Allow the agent to execute approved actions without human review</div>
              </div>
              <Toggle on={autoRecovery} onToggle={() => setAutoRecovery(!autoRecovery)} label="Automated recovery" />
            </div>
            <div className="border-t border-[#20354a] pt-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-medium text-white">Maximum payment retries</div>
                <span className="text-xs font-semibold text-[#4f8cff]">{maxRetries}</span>
              </div>
              <input type="range" min={0} max={5} value={maxRetries} onChange={(e) => setMaxRetries(Number(e.target.value))} className="w-full accent-[#4f8cff]" />
              <div className="mt-2 flex justify-between text-[10px] text-[#6f89a4]"><span>0 (off)</span><span>5 (max)</span></div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="surface rounded-xl p-5">
          <SectionHeading eyebrow="Notifications" title="Alert preferences" />
          <div className="space-y-4">
            <ToggleRow label="Email notifications" desc="Recovery success, failures, and summaries" on={notifEmail} onToggle={() => setNotifEmail(!notifEmail)} />
            <ToggleRow label="WhatsApp alerts" desc="High-value escalations and policy violations" on={notifWhatsApp} onToggle={() => setNotifWhatsApp(!notifWhatsApp)} />
            <ToggleRow label="Escalation alerts" desc="Immediate alert when a case is escalated to human review" on={notifEscalation} onToggle={() => setNotifEscalation(!notifEscalation)} />
          </div>
        </div>

        {/* Subscription */}
        <div className="surface rounded-xl p-5">
          <SectionHeading eyebrow="Plan" title="Subscription" />
          <div className="flex items-center justify-between rounded-lg bg-[#13263a] p-4">
            <div>
              <div className="text-sm font-semibold text-white">Growth plan</div>
              <div className="mt-0.5 text-[11px] text-[#7f94aa]">₹29,999/month · 500 recovery cases included</div>
            </div>
            <span className="rounded-full bg-[#4f8cff]/15 px-2.5 py-1 text-[10px] font-medium text-[#83adff]">ACTIVE</span>
          </div>
          <div className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between"><span className="text-[#8da2b8]">Recovery cases used</span><span className="text-white">137 / 500</span></div>
            <div className="h-2 rounded-full bg-[#182d43]"><div className="h-2 rounded-full bg-[#4f8cff]" style={{ width: '27.4%' }} /></div>
            <div className="flex justify-between"><span className="text-[#8da2b8]">Next billing date</span><span className="text-white">01 Sep 2026</span></div>
          </div>
          <button className="mt-4 w-full rounded-lg border border-[#20354a] py-2.5 text-xs font-medium text-[#a6b7c7] hover:border-[#4f8cff] hover:text-white">Upgrade to Scale plan</button>
        </div>
      </div>
    </>
  );
}

function ToggleRow({ label, desc, on, onToggle }: { label: string; desc: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs font-medium text-white">{label}</div>
        <div className="mt-0.5 text-[11px] text-[#7f94aa]">{desc}</div>
      </div>
      <Toggle on={on} onToggle={onToggle} label={label} />
    </div>
  );
}

/* Enhanced Policies with policy-AI integration */
export function PoliciesView() {
  const policies = [
    { name: 'PAYMENT_RECOVERY_01', desc: 'Retry failed payment', maxAttempts: 3, retryInterval: '6 hours', maxAmount: '₹50,000', channels: ['Email', 'WhatsApp'], escalateWhen: ['Amount > ₹50,000', '3 failed attempts', 'Enterprise customer', 'AI confidence < 80%'], enforced: true },
    { name: 'COLLECTIONS_ESCALATION_02', desc: 'Escalate overdue invoice', maxAttempts: 2, retryInterval: '24 hours', maxAmount: '₹2,00,000', channels: ['Email'], escalateWhen: ['Amount > ₹1,00,000', '30+ days overdue', 'AI confidence < 85%'], enforced: true },
    { name: 'OPT_OUT_PROTECTION', desc: 'Do not contact opted-out customers', maxAttempts: 0, retryInterval: 'N/A', maxAmount: 'N/A', channels: [], escalateWhen: ['customer_opted_out = true'], enforced: true },
    { name: 'PAYMENT_SUCCESS_STOP', desc: 'Close case on payment success', maxAttempts: 0, retryInterval: 'N/A', maxAmount: 'N/A', channels: [], escalateWhen: ['payment_success = true'], enforced: true },
  ];

  return (
    <>
      <PageTitle
        title="Policies"
        description="Deterministic guardrails evaluated before every external action."
        action={<button className="flex items-center gap-2 rounded-lg bg-[#4f8cff] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#6099ff]"><Plus size={14} />New policy</button>}
      />
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#214b35] bg-[#10291b] p-4">
        <ShieldCheck className="text-[#45d879]" size={20} />
        <div>
          <div className="text-xs font-semibold text-white">Policy engine is enforcing all actions</div>
          <div className="mt-0.5 text-[11px] text-[#8fcaa3]">The AI can recommend an action, but cannot override these rules.</div>
        </div>
        <span className="ml-auto rounded-full bg-[#22c55e]/15 px-2.5 py-1 text-[10px] font-medium text-[#59df86]">{policies.length} ACTIVE</span>
      </div>
      <div className="space-y-4">
        {policies.map((p) => (
          <div key={p.name} className="surface rounded-xl p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-white">{p.name}</span>
                  {p.enforced && <span className="rounded-full bg-green-400/10 px-2 py-0.5 text-[10px] font-medium text-green-400">ENFORCED</span>}
                </div>
                <div className="mt-1 text-[11px] text-[#7f94aa]">{p.desc}</div>
              </div>
              <button className="text-[#668097] hover:text-white"><MoreHorizontal size={17} /></button>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <PolicyDetail label="Max attempts" value={String(p.maxAttempts)} />
              <PolicyDetail label="Retry interval" value={p.retryInterval} />
              <PolicyDetail label="Max amount" value={p.maxAmount} />
              <div>
                <div className="text-[10px] uppercase tracking-[.12em] text-[#6f89a4]">Allowed channels</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {p.channels.length > 0 ? p.channels.map((ch) => (
                    <span key={ch} className="rounded bg-[#13263a] px-2 py-0.5 text-[11px] text-[#94b6dc]">{ch}</span>
                  )) : <span className="text-[11px] text-[#5d7894]">N/A</span>}
                </div>
              </div>
            </div>
            <div className="mt-4 border-t border-[#20354a] pt-4">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#6f89a4]">Escalate when</div>
              <div className="flex flex-wrap gap-2">
                {p.escalateWhen.map((cond) => (
                  <span key={cond} className="flex items-center gap-1.5 rounded-lg border border-[#20354a] bg-[#091725] px-2.5 py-1.5 font-mono text-[11px] text-[#a2b5c7]">
                    <Zap size={11} className="text-[#f0b44f]" /> {cond}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PolicyDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[.12em] text-[#6f89a4]">{label}</div>
      <div className="mt-1.5 text-xs font-medium text-white">{value}</div>
    </div>
  );
}
