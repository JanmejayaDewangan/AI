'use client';

import { useMemo, useState } from 'react';
import {
  Bell, Check, ChevronRight, Clock3, CreditCard, FileClock, Filter, Mail,
  MessageSquareText, MoreHorizontal, Plus, RefreshCw, Search, Send,
  SlidersHorizontal, UserPlus, Zap,
} from 'lucide-react';
import { casesSeed, filterOptions, money, type Case } from '@/lib/recovery-data';
import { ConfidenceMeter, PageTitle, RiskBadge, StatusBadge } from '@/components/recovery-ui';

export function CasesView({
  onSelect, externalFilter,
}: {
  onSelect: (item: Case) => void;
  externalFilter?: string | null;
}) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    risk: 'All', type: 'All', amount: 'All', status: 'All', channel: 'All', confidence: 'All',
  });
  const [showBulkConfirm, setShowBulkConfirm] = useState<null | { action: string; icon: typeof Send }>(null);
  const [sortBy, setSortBy] = useState<'amount' | 'risk' | 'deadline'>('amount');

  const allCases = useMemo(() => {
    let result = [...casesSeed];
    if (externalFilter) {
      const filterMap: Record<string, string> = { Critical: 'Critical', High: 'High', Medium: 'Medium', Low: 'Low' };
      if (filterMap[externalFilter]) result = result.filter((c) => c.risk === externalFilter);
      else result = result.filter((c) => c.type.toLowerCase().includes(externalFilter.toLowerCase()) || c.diagnosis.toLowerCase().includes(externalFilter.toLowerCase()));
    }
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((c) => `${c.customer} ${c.ref} ${c.id} ${c.type} ${c.status}`.toLowerCase().includes(q));
    }
    if (activeFilters.risk !== 'All') result = result.filter((c) => c.risk === activeFilters.risk);
    if (activeFilters.type !== 'All') result = result.filter((c) => c.type.toLowerCase().includes(activeFilters.type.toLowerCase()));
    if (activeFilters.status !== 'All') {
      const statusMap: Record<string, string> = { 'In Progress': 'Recovery in Progress', 'Awaiting Payment': 'Awaiting Payment', Detected: 'Detected', Escalated: 'Escalated', Recovered: 'Recovered' };
      result = result.filter((c) => c.status === statusMap[activeFilters.status]);
    }
    if (activeFilters.confidence !== 'All') {
      if (activeFilters.confidence === '90%+') result = result.filter((c) => c.confidence >= 90);
      else if (activeFilters.confidence === '75–90%') result = result.filter((c) => c.confidence >= 75 && c.confidence < 90);
      else result = result.filter((c) => c.confidence < 75);
    }
    if (sortBy === 'amount') result.sort((a, b) => b.amount - a.amount);
    return result;
  }, [query, activeFilters, sortBy, externalFilter]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === allCases.length) setSelected(new Set());
    else setSelected(new Set(allCases.map((c) => c.id)));
  };

  const selectedCases = allCases.filter((c) => selected.has(c.id));
  const selectedAmount = selectedCases.reduce((sum, c) => sum + c.amount, 0);

  const bulkActions = [
    { label: 'Send Reminder', icon: MessageSquareText },
    { label: 'Retry Payment', icon: RefreshCw },
    { label: 'Assign Owner', icon: UserPlus },
    { label: 'Escalate', icon: Zap },
    { label: 'Snooze', icon: Clock3 },
    { label: 'Mark Resolved', icon: Check },
  ];

  return (
    <>
      <PageTitle
        title="Recovery cases"
        description="Every revenue-risk event, from detection through verified recovery."
        action={<button className="flex items-center gap-2 rounded-lg bg-[#4f8cff] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#6099ff]"><Plus size={14} />Create case</button>}
      />

      {/* Filters Bar */}
      <div className="surface mb-4 rounded-xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-2.5 text-[#637b94]" size={15} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by customer, case ID, or type..."
              className="w-full rounded-lg border border-[#20354a] bg-[#091725] py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-[#60778e] focus:border-[#4f8cff]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['risk', 'type', 'status', 'confidence'] as const).map((filterKey) => (
              <FilterDropdown
                key={filterKey}
                label={filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
                options={filterOptions[filterKey]}
                value={activeFilters[filterKey]}
                onChange={(v) => setActiveFilters((prev) => ({ ...prev, [filterKey]: v }))}
              />
            ))}
            <button
              onClick={() => setSortBy(sortBy === 'amount' ? 'risk' : 'amount')}
              className="flex items-center gap-2 rounded-lg border border-[#20354a] px-3 py-2 text-xs text-[#9cb0c3] hover:border-[#4f8cff]"
            >
              <Filter size={14} />Sort: {sortBy === 'amount' ? 'Amount' : 'Risk'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#4f8cff]/30 bg-[#4f8cff]/5 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4f8cff] text-xs font-semibold text-white">{selected.size}</span>
            <span className="text-xs font-medium text-white">{selected.size} cases selected</span>
            <span className="text-[11px] text-[#7f94aa]">{money(selectedAmount)} total revenue at risk</span>
            <button onClick={() => setSelected(new Set())} className="text-[11px] text-[#72a2ff] hover:text-white">Clear</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {bulkActions.map((action) => (
              <button
                key={action.label}
                onClick={() => setShowBulkConfirm({ action: action.label, icon: action.icon })}
                className="flex items-center gap-1.5 rounded-lg border border-[#20354a] bg-[#091725] px-2.5 py-1.5 text-[11px] font-medium text-[#a6b7c7] hover:border-[#4f8cff] hover:text-white"
              >
                <action.icon size={13} />{action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cases Table */}
      <div className="surface overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="border-b border-[#20354a] text-[10px] uppercase tracking-[.12em] text-[#647d96]">
              <tr>
                <th className="px-3 py-3"><input type="checkbox" checked={selected.size === allCases.length && allCases.length > 0} onChange={toggleAll} className="accent-[#4f8cff]" /></th>
                <th className="px-3 py-3 font-medium">Case</th>
                <th className="px-3 py-3 font-medium">Risk</th>
                <th className="px-3 py-3 font-medium">Amount</th>
                <th className="px-3 py-3 font-medium">Recovery Prob.</th>
                <th className="px-3 py-3 font-medium">Next Best Action</th>
                <th className="px-3 py-3 font-medium">Owner</th>
                <th className="px-3 py-3 font-medium">Deadline</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {allCases.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className={`data-row cursor-pointer border-b border-[#20354a]/70 ${selected.has(item.id) ? 'bg-[#4f8cff]/5' : ''}`}
                >
                  <td className="px-3 py-4" onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}>
                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="accent-[#4f8cff]" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="font-mono text-xs font-medium text-white">{item.id}</div>
                    <div className="mt-0.5 text-[10px] text-[#7189a1]">{item.customer} · {item.ref}</div>
                    <div className="mt-1 text-[10px] text-[#5d7894]">{item.type}</div>
                  </td>
                  <td className="px-3 py-4"><RiskBadge risk={item.risk} /></td>
                  <td className="px-3 py-4 text-xs font-semibold text-white">{money(item.amount)}</td>
                  <td className="px-3 py-4"><ConfidenceMeter value={item.probability} /></td>
                  <td className="max-w-[200px] px-3 py-4 text-[11px] text-[#a1b2c4]">{item.nextAction}</td>
                  <td className="px-3 py-4 text-[11px] text-[#9bb0c4]">{item.owner}</td>
                  <td className="px-3 py-4 text-[11px] text-[#f0b44f]">{item.deadline}</td>
                  <td className="px-3 py-4"><StatusBadge status={item.status} /></td>
                  <td className="px-3 py-4 text-right"><ChevronRight size={15} className="text-[#5d7894]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 text-[11px] text-[#7189a1]">
          <span>Showing {allCases.length} of 137 cases</span>
          <span className="flex items-center gap-1">
            <button className="rounded border border-[#20354a] px-2 py-1 text-white">1</button>
            <button className="px-2 py-1">2</button>
            <button className="px-2 py-1">3</button>
          </span>
        </div>
      </div>

      {/* Bulk Confirmation Modal */}
      {showBulkConfirm && (
        <BulkConfirmModal
          action={showBulkConfirm.action}
          icon={showBulkConfirm.icon}
          count={selected.size}
          totalAmount={selectedAmount}
          customers={selectedCases.map((c) => c.customer)}
          onConfirm={() => { setShowBulkConfirm(null); setSelected(new Set()); }}
          onCancel={() => setShowBulkConfirm(null)}
        />
      )}
    </>
  );
}

function FilterDropdown({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="flex items-center gap-2 rounded-lg border border-[#20354a] px-3 py-2 text-xs text-[#9cb0c3] hover:border-[#4f8cff]"
      >
        <SlidersHorizontal size={14} />{label}: <span className="text-white">{value}</span>
        <ChevronRight size={13} className={`rotate-90 transition-transform ${open ? '-rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-40 rounded-lg border border-[#20354a] bg-[#0c1a2a] py-1 shadow-xl">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`flex w-full items-center justify-between px-3 py-2 text-[11px] hover:bg-[#13263a] ${opt === value ? 'text-white' : 'text-[#9cb0c3]'}`}
            >
              {opt}
              {opt === value && <Check size={13} className="text-[#4f8cff]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BulkConfirmModal({
  action, icon: Icon, count, totalAmount, customers, onConfirm, onCancel,
}: {
  action: string; icon: typeof Send; count: number; totalAmount: number; customers: string[]; onConfirm: () => void; onCancel: () => void;
}) {
  const needsApproval = action === 'Escalate' || action === 'Retry Payment';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="w-full max-w-md rounded-xl border border-[#20354a] bg-[#0b1b2b] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4f8cff]/15 text-[#83adff]"><Icon size={20} /></div>
          <div>
            <h3 className="text-sm font-semibold text-white">Confirm: {action}</h3>
            <p className="text-[11px] text-[#7f94aa]">Review the impact before executing</p>
          </div>
        </div>
        <div className="space-y-3 rounded-lg border border-[#20354a] bg-[#091725] p-4 text-xs">
          <div className="flex justify-between"><span className="text-[#7f94aa]">Customers affected</span><span className="font-semibold text-white">{count}</span></div>
          <div className="flex justify-between"><span className="text-[#7f94aa]">Total revenue involved</span><span className="font-semibold text-white">{money(totalAmount)}</span></div>
          <div className="flex justify-between"><span className="text-[#7f94aa]">Communication channel</span><span className="text-white">WhatsApp + Email</span></div>
          <div className="flex justify-between"><span className="text-[#7f94aa]">Action</span><span className="text-white">{action}</span></div>
          <div className="flex justify-between"><span className="text-[#7f94aa]">Policy</span><span className="font-mono text-[#94b6dc]">PAYMENT_RECOVERY_01</span></div>
          <div className="flex justify-between">
            <span className="text-[#7f94aa]">Human approval required</span>
            <span className={needsApproval ? 'font-semibold text-amber-300' : 'font-semibold text-green-300'}>{needsApproval ? 'Yes' : 'No'}</span>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-[#7f94aa]">
          Customers: {customers.join(', ')}
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-[#20354a] py-2.5 text-xs font-medium text-[#a6b7c7] hover:border-[#4f8cff]">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 rounded-lg py-2.5 text-xs font-semibold text-white ${needsApproval ? 'bg-amber-500/90 hover:bg-amber-500' : 'bg-[#22c55e] hover:bg-[#2bd96c]'}`}>
            {needsApproval ? 'Approve & Execute' : 'Execute'}
          </button>
        </div>
      </div>
    </div>
  );
}
