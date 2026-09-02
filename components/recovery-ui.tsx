import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Recovered: 'bg-green-400/10 text-green-400',
    Escalated: 'bg-red-400/10 text-red-300',
    'Recovery in Progress': 'bg-blue-400/10 text-blue-300',
    'Awaiting Payment': 'bg-amber-400/10 text-amber-300',
    Detected: 'bg-slate-400/10 text-slate-300',
    Closed: 'bg-slate-400/10 text-slate-300',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[status] ?? styles.Detected}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: string }) {
  const style =
    risk === 'Critical' ? 'text-red-300 bg-red-400/10'
    : risk === 'High' ? 'text-amber-300 bg-amber-400/10'
    : risk === 'Low' ? 'text-green-300 bg-green-400/10'
    : 'text-slate-300 bg-slate-400/10';
  return <span className={`rounded-md px-2 py-1 text-[11px] ${style}`}>{risk}</span>;
}

export function ConfidenceMeter({ value }: { value: number }) {
  const color = value >= 90 ? '#22c55e' : value >= 75 ? '#4f8cff' : '#f59e0b';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-[#182d43]">
        <div className="h-1.5 rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-[11px] font-medium text-white">{value}%</span>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="mb-1 text-[10px] font-semibold uppercase tracking-[.18em] text-[#6f89a4]">{eyebrow}</div>}
        <h2 className="text-base font-semibold tracking-[-.02em] text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function PageTitle({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#6f89a4]">Workspace</div>
        <h1 className="text-2xl font-semibold tracking-[-.04em] text-white">{title}</h1>
        <p className="mt-1 text-sm text-[#8da2b8]">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Kpi({ title, value, detail, trend, icon: Icon, color, onClick }: { title: string; value: string; detail: string; trend: string; icon: LucideIcon; color: string; onClick?: () => void }) {
  const colors: Record<string, string> = {
    amber: 'text-amber-300 bg-amber-400/10',
    green: 'text-green-300 bg-green-400/10',
    blue: 'text-blue-300 bg-blue-400/10',
    slate: 'text-slate-300 bg-slate-400/10',
    red: 'text-red-300 bg-red-400/10',
  };
  return (
    <button
      onClick={onClick}
      className={`kpi-card surface flex flex-col rounded-xl p-4 text-left transition-colors ${onClick ? 'cursor-pointer hover:border-[#4f8cff]/40' : ''}`}
    >
      <div className="mb-5 flex items-start justify-between">
        <span className="text-[11px] font-medium text-[#8da2b8]">{title}</span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${colors[color]}`}><Icon size={15} /></span>
      </div>
      <div className="text-xl font-semibold tracking-[-.03em] text-white">{value}</div>
      <div className="mt-2 flex items-center gap-1 text-[10px] text-[#7890a8]">
        <span className={trend === 'up' ? 'text-[#45d879]' : 'text-[#f0b44f]'}>
          {trend === 'up' ? <ArrowUpRight className="inline" size={12} /> : <ArrowDownRight className="inline" size={12} />}
        </span>
        {detail}
      </div>
    </button>
  );
}

export function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label?: string }) {
  return (
    <button
      aria-label={label}
      onClick={onToggle}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-[#22c55e]' : 'bg-[#294057]'}`}
    >
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export function ActionButton({ children, variant = 'primary', onClick, className = '' }: { children: React.ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'; onClick?: () => void; className?: string }) {
  const variants: Record<string, string> = {
    primary: 'bg-[#4f8cff] text-white hover:bg-[#6099ff]',
    secondary: 'border border-[#2a4662] bg-[#0d1b2a] text-[#c8d6e5] hover:border-[#4f8cff]',
    ghost: 'border border-[#20354a] text-[#a6b7c7] hover:border-[#4f8cff] hover:text-white',
    danger: 'bg-red-500/90 text-white hover:bg-red-500',
    success: 'bg-[#22c55e] text-white hover:bg-[#2bd96c]',
  };
  return (
    <button onClick={onClick} className={`flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function SurfaceCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`surface rounded-xl ${className}`}>{children}</div>;
}

export function ProgressBar({ value, max, color = '#4f8cff', height = 'h-2' }: { value: number; max: number; color?: string; height?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className={`${height} w-full rounded-full bg-[#182d43]`}>
      <div className={`${height} rounded-full transition-all`} style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
