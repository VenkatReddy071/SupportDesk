import { useEffect, useState } from 'react';
import { AlertTriangle, Filter, Search, CheckCircle, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { RiskAlert, RiskLevel, AlertStatus } from '../lib/supabase';
import RiskBadge, { StatusBadge } from '../components/RiskBadge';
import Header from '../components/Header';
 
const ALERT_TYPE_LABELS: Record<string, string> = {
  aml: 'AML',
  fraud: 'Fraud',
  kyc: 'KYC',
  credit: 'Credit',
  compliance: 'Compliance',
  suspicious_activity: 'Suspicious Activity',
};
 
interface AlertDetailModalProps {
  alert: RiskAlert;
  onClose: () => void;
  onStatusChange: (id: string, status: AlertStatus) => void;
}
 
function AlertDetailModal({ alert, onClose, onStatusChange }: AlertDetailModalProps) {
  const fmtDate = (s: string) => new Date(s).toLocaleString();
  return (
<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
<div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
<div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
<div className="flex items-center gap-3">
<div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              alert.severity === 'critical' ? 'bg-red-100' :
              alert.severity === 'high' ? 'bg-orange-100' :
              alert.severity === 'medium' ? 'bg-amber-100' : 'bg-emerald-100'
            }`}>
<AlertTriangle size={18} className={
                alert.severity === 'critical' ? 'text-red-600' :
                alert.severity === 'high' ? 'text-orange-600' :
                alert.severity === 'medium' ? 'text-amber-600' : 'text-emerald-600'
              } />
</div>
<div>
<p className="font-semibold text-slate-900">{alert.title}</p>
<p className="text-xs text-slate-400 mt-0.5">{ALERT_TYPE_LABELS[alert.alert_type]} Alert</p>
</div>
</div>
<button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">&times;</button>
</div>
<div className="px-6 py-4 space-y-4">
<div className="flex flex-wrap gap-2">
<RiskBadge level={alert.severity} />
<StatusBadge status={alert.status} />
</div>
<div>
<p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Description</p>
<p className="text-sm text-slate-700 leading-relaxed">{alert.description}</p>
</div>
<div className="grid grid-cols-2 gap-3">
<div>
<p className="text-xs text-slate-400">Customer</p>
<p className="text-sm font-medium text-slate-900">{(alert.customers as any)?.name ?? 'Unknown'}</p>
</div>
<div>
<p className="text-xs text-slate-400">Assigned To</p>
<p className="text-sm font-medium text-slate-900">{alert.assigned_to || 'Unassigned'}</p>
</div>
<div>
<p className="text-xs text-slate-400">Created</p>
<p className="text-sm font-medium text-slate-900">{fmtDate(alert.created_at)}</p>
</div>
            {alert.resolved_at && (
<div>
<p className="text-xs text-slate-400">Resolved</p>
<p className="text-sm font-medium text-slate-900">{fmtDate(alert.resolved_at)}</p>
</div>
            )}
</div>
</div>
<div className="px-6 py-4 border-t border-slate-100 flex gap-2 flex-wrap">
          {alert.status !== 'investigating' && (
<button
              onClick={() => onStatusChange(alert.id, 'investigating')}
              className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
>
              Mark Investigating
</button>
          )}
          {alert.status !== 'resolved' && (
<button
              onClick={() => onStatusChange(alert.id, 'resolved')}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
>
              Resolve
</button>
          )}
          {alert.status !== 'dismissed' && (
<button
              onClick={() => onStatusChange(alert.id, 'dismissed')}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
>
              Dismiss
</button>
          )}
</div>
</div>
</div>
  );
}
 
interface Props { onMenuClick: () => void; }
 
export default function RiskAlerts({ onMenuClick }: Props) {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<RiskLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [selected, setSelected] = useState<RiskAlert | null>(null);
 
  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('risk_alerts')
      .select('*, customers(name)')
      .order('created_at', { ascending: false });
    setAlerts((data ?? []) as RiskAlert[]);
    setLoading(false);
  };
 
  useEffect(() => { load(); }, []);
 
  const updateStatus = async (id: string, status: AlertStatus) => {
    await supabase.from('risk_alerts').update({
      status,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null,
    }).eq('id', id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status, resolved_at: status === 'resolved' ? new Date().toISOString() : null } : a));
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
  };
 
  const filtered = alerts.filter(a => {
    const matchSearch = search === '' || a.title.toLowerCase().includes(search.toLowerCase()) || (a.customers as any)?.name?.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchSeverity && matchStatus;
  });
 
  const fmtTime = (s: string) => {
    const diff = (Date.now() - new Date(s).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };
 
  return (
<div className="flex flex-col h-full">
<Header
        title="Risk Alerts"
        subtitle={`${filtered.length} alerts`}
        onMenuClick={onMenuClick}
        onRefresh={load}
        loading={loading}
      />
<div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {/* Filters */}
<div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
<div className="flex-1 min-w-48 relative">
<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
<input
              type="text"
              placeholder="Search alerts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
</div>
<div className="flex items-center gap-2">
<Filter size={14} className="text-slate-400" />
<select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value as RiskLevel | 'all')}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
<option value="all">All Severity</option>
<option value="critical">Critical</option>
<option value="high">High</option>
<option value="medium">Medium</option>
<option value="low">Low</option>
</select>
<select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as AlertStatus | 'all')}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
<option value="all">All Status</option>
<option value="open">Open</option>
<option value="investigating">Investigating</option>
<option value="resolved">Resolved</option>
<option value="dismissed">Dismissed</option>
</select>
</div>
</div>
 
        {/* Alert summary cards */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['critical', 'high', 'medium', 'low'] as RiskLevel[]).map(sev => {
            const count = alerts.filter(a => a.severity === sev && a.status !== 'resolved' && a.status !== 'dismissed').length;
            return (
<button
                key={sev}
                onClick={() => setSeverityFilter(sev === severityFilter ? 'all' : sev)}
                className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm ${severityFilter === sev ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}
>
<p className="text-xl font-bold text-slate-900">{count}</p>
<RiskBadge level={sev} size="sm" />
</button>
            );
          })}
</div>
 
        {/* Alerts table */}
<div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
<div className="p-8 text-center text-slate-400 text-sm">Loading alerts...</div>
          ) : filtered.length === 0 ? (
<div className="p-8 text-center text-slate-400 text-sm">No alerts match your filters.</div>
          ) : (
<div className="overflow-x-auto">
<table className="w-full text-sm">
<thead>
<tr className="bg-slate-50 border-b border-slate-100">
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Alert</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Type</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Severity</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Status</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Time</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-50">
                  {filtered.map(alert => (
<tr key={alert.id} className="hover:bg-slate-50 transition-colors">
<td className="px-5 py-3.5 max-w-xs">
<p className="font-medium text-slate-800 truncate">{alert.title}</p>
<p className="text-xs text-slate-400 truncate mt-0.5 max-w-48">{alert.description}</p>
</td>
<td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{(alert.customers as any)?.name ?? '—'}</td>
<td className="px-5 py-3.5 hidden sm:table-cell">
<span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                          {ALERT_TYPE_LABELS[alert.alert_type]}
</span>
</td>
<td className="px-5 py-3.5"><RiskBadge level={alert.severity} size="sm" /></td>
<td className="px-5 py-3.5 hidden md:table-cell"><StatusBadge status={alert.status} /></td>
<td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell whitespace-nowrap">{fmtTime(alert.created_at)}</td>
<td className="px-5 py-3.5">
<div className="flex gap-1">
<button
                            onClick={() => setSelected(alert)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
>
<Eye size={14} />
</button>
                          {alert.status !== 'resolved' && (
<button
                              onClick={() => updateStatus(alert.id, 'resolved')}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Resolve alert"
>
<CheckCircle size={14} />
</button>
                          )}
</div>
</td>
</tr>
                  ))}
</tbody>
</table>
</div>
          )}
</div>
</div>
 
      {selected && (
<AlertDetailModal
          alert={selected}
          onClose={() => setSelected(null)}
          onStatusChange={updateStatus}
        />
      )}
</div>
  );
}