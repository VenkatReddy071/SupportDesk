import type { RiskLevel } from '../lib/supabase';

const styles: Record<RiskLevel, string> = {
  low: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  high: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  critical: 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

export default function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1 font-medium rounded-full capitalize
      ${styles[level]}
      ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        level === 'low' ? 'bg-emerald-500' :
        level === 'medium' ? 'bg-amber-500' :
        level === 'high' ? 'bg-orange-500' : 'bg-red-500'
      }`} />
      {level}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    verified: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    resolved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    open: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    pending: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    investigating: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    flagged: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    failed: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    expired: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    blocked: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    frozen: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    suspended: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    dismissed: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    closed: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

 