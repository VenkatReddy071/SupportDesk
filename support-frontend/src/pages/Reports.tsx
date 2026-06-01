import { useEffect, useState } from 'react';

import { BarChart2, TrendingUp, Download, FileText } from 'lucide-react';

import { supabase } from '../lib/supabase';

import Header from '../components/Header';
 
interface ReportStats {

  customersByRisk: { level: string; count: number }[];

  alertsByType: { type: string; count: number }[];

  txnsByStatus: { status: string; count: number; volume: number }[];

  topFlaggedCustomers: { name: string; flaggedCount: number; riskLevel: string }[];

  monthlyAlerts: { month: string; count: number }[];

}
 
function BarChartViz({ data, keyLabel, valueKey, colorFn }: {

  data: { [key: string]: string | number }[];

  keyLabel: string;

  valueKey: string;

  colorFn: (item: { [key: string]: string | number }) => string;

}) {

  const max = Math.max(...data.map(d => Number(d[valueKey])), 1);

  return (
<div className="space-y-2">

      {data.map((item, i) => (
<div key={i} className="flex items-center gap-3">
<div className="w-24 text-xs text-slate-500 capitalize truncate text-right">{String(item[keyLabel])}</div>
<div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
<div

              className={`h-full rounded-lg transition-all duration-500 ${colorFn(item)}`}

              style={{ width: `${(Number(item[valueKey]) / max) * 100}%` }}

            />
</div>
<div className="w-10 text-xs font-semibold text-slate-700 text-right">{item[valueKey]}</div>
</div>

      ))}
</div>

  );

}
 
interface Props { onMenuClick: () => void; }
 
export default function Reports({ onMenuClick }: Props) {

  const [stats, setStats] = useState<ReportStats | null>(null);

  const [loading, setLoading] = useState(true);
 
  const load = async () => {

    setLoading(true);

    const [

      { data: customers },

      { data: alerts },

      { data: transactions },

    ] = await Promise.all([

      supabase.from('customers').select('risk_level, name'),

      supabase.from('risk_alerts').select('alert_type, severity, status, created_at, customers(name)'),

      supabase.from('transactions').select('status, amount, flagged, customer_id, customers(name)'),

    ]);
 
    const riskCounts: Record<string, number> = {};

    (customers ?? []).forEach((c: any) => { riskCounts[c.risk_level] = (riskCounts[c.risk_level] ?? 0) + 1; });
 
    const typeCounts: Record<string, number> = {};

    (alerts ?? []).forEach((a: any) => { typeCounts[a.alert_type] = (typeCounts[a.alert_type] ?? 0) + 1; });
 
    const statusData: Record<string, { count: number; volume: number }> = {};

    (transactions ?? []).forEach((t: any) => {

      if (!statusData[t.status]) statusData[t.status] = { count: 0, volume: 0 };

      statusData[t.status].count++;

      statusData[t.status].volume += Number(t.amount);

    });
 
    const flaggedByCustomer: Record<string, { name: string; count: number; riskLevel: string }> = {};

    (transactions ?? []).filter((t: any) => t.flagged).forEach((t: any) => {

      const name = (t.customers as any)?.name ?? 'Unknown';

      if (!flaggedByCustomer[name]) flaggedByCustomer[name] = { name, count: 0, riskLevel: 'medium' };

      flaggedByCustomer[name].count++;

    });
 
    setStats({

      customersByRisk: ['critical', 'high', 'medium', 'low'].map(l => ({ level: l, count: riskCounts[l] ?? 0 })),

      alertsByType: Object.entries(typeCounts).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count),

      txnsByStatus: Object.entries(statusData).map(([status, d]) => ({ status, count: d.count, volume: Math.round(d.volume) })),

      topFlaggedCustomers: Object.values(flaggedByCustomer).sort((a, b) => b.count - a.count).slice(0, 5),

      monthlyAlerts: [],

    });

    setLoading(false);

  };
 
  useEffect(() => { load(); }, []);
 
  const riskColors: Record<string, string> = {

    critical: 'bg-red-500',

    high: 'bg-orange-500',

    medium: 'bg-amber-400',

    low: 'bg-emerald-500',

  };
 
  const typeColors: Record<string, string> = {

    aml: 'bg-red-500',

    fraud: 'bg-orange-500',

    kyc: 'bg-amber-400',

    compliance: 'bg-blue-500',

    credit: 'bg-slate-400',

    suspicious_activity: 'bg-slate-500',

  };
 
  const statusColors: Record<string, string> = {

    completed: 'bg-emerald-500',

    flagged: 'bg-orange-500',

    blocked: 'bg-red-500',

    pending: 'bg-slate-400',

    failed: 'bg-slate-500',

  };
 
  const fmtCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(n);
 
  return (
<div className="flex flex-col h-full">
<Header

        title="Reports & Analytics"

        subtitle="Risk monitoring insights"

        onMenuClick={onMenuClick}

        onRefresh={load}

        loading={loading}

        actions={
<button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
<Download size={14} />
<span className="hidden sm:inline">Export</span>
</button>

        }

      />
<div className="flex-1 overflow-y-auto p-4 lg:p-6">

        {loading ? (
<div className="text-center text-slate-400 text-sm py-8">Generating report...</div>

        ) : stats && (
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Customer Risk Distribution */}
<div className="bg-white rounded-xl border border-slate-200 p-5">
<div className="flex items-center gap-2 mb-4">
<BarChart2 size={16} className="text-blue-600" />
<h3 className="font-semibold text-slate-900">Customers by Risk Level</h3>
</div>
<BarChartViz

                data={stats.customersByRisk.map(d => ({ level: d.level, count: d.count }))}

                keyLabel="level"

                valueKey="count"

                colorFn={item => riskColors[String(item.level)] ?? 'bg-slate-400'}

              />
</div>
 
            {/* Alerts by Type */}
<div className="bg-white rounded-xl border border-slate-200 p-5">
<div className="flex items-center gap-2 mb-4">
<TrendingUp size={16} className="text-amber-500" />
<h3 className="font-semibold text-slate-900">Alerts by Type</h3>
</div>
<BarChartViz

                data={stats.alertsByType.map(d => ({ type: d.type.toUpperCase(), count: d.count }))}

                keyLabel="type"

                valueKey="count"

                colorFn={item => typeColors[String(item.type).toLowerCase()] ?? 'bg-slate-400'}

              />
</div>
 
            {/* Transaction Status */}
<div className="bg-white rounded-xl border border-slate-200 p-5">
<div className="flex items-center gap-2 mb-4">
<BarChart2 size={16} className="text-emerald-500" />
<h3 className="font-semibold text-slate-900">Transactions by Status</h3>
</div>
<BarChartViz

                data={stats.txnsByStatus.map(d => ({ status: d.status, count: d.count }))}

                keyLabel="status"

                valueKey="count"

                colorFn={item => statusColors[String(item.status)] ?? 'bg-slate-400'}

              />
<div className="mt-3 pt-3 border-t border-slate-100">
<p className="text-xs text-slate-400">Transaction Volumes</p>
<div className="space-y-1 mt-1">

                  {stats.txnsByStatus.map(d => (
<div key={d.status} className="flex justify-between text-xs">
<span className="capitalize text-slate-500">{d.status}</span>
<span className="font-medium text-slate-700">{fmtCurrency(d.volume)}</span>
</div>

                  ))}
</div>
</div>
</div>
 
            {/* Top Flagged Customers */}
<div className="bg-white rounded-xl border border-slate-200 p-5">
<div className="flex items-center gap-2 mb-4">
<FileText size={16} className="text-red-500" />
<h3 className="font-semibold text-slate-900">Top Flagged Customers</h3>
</div>

              {stats.topFlaggedCustomers.length === 0 ? (
<p className="text-sm text-slate-400">No flagged customers found.</p>

              ) : (
<div className="space-y-3">

                  {stats.topFlaggedCustomers.map((c, i) => (
<div key={c.name} className="flex items-center gap-3">
<div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">

                        {i + 1}
</div>
<div className="flex-1">
<p className="text-sm font-medium text-slate-800">{c.name}</p>
</div>
<div className="flex items-center gap-2">
<span className="text-sm font-bold text-red-600">{c.count}</span>
<span className="text-xs text-slate-400">flags</span>
</div>
</div>

                  ))}
</div>

              )}
</div>
 
            {/* Summary Metrics */}
<div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
<h3 className="font-semibold text-slate-900 mb-4">AML Compliance Summary</h3>
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                {[

                  { label: 'Suspicious Activity Reports', value: stats.alertsByType.find(a => a.type === 'aml')?.count ?? 0, note: 'SAR filings required' },

                  { label: 'KYC Failures', value: stats.alertsByType.find(a => a.type === 'kyc')?.count ?? 0, note: 'Accounts restricted' },

                  { label: 'Fraud Incidents', value: stats.alertsByType.find(a => a.type === 'fraud')?.count ?? 0, note: 'Under investigation' },

                  { label: 'Compliance Breaches', value: stats.alertsByType.find(a => a.type === 'compliance')?.count ?? 0, note: 'Policy violations' },

                ].map(({ label, value, note }) => (
<div key={label} className="bg-slate-50 rounded-xl p-4">
<p className="text-2xl font-bold text-slate-900">{value}</p>
<p className="text-sm font-medium text-slate-700 mt-1">{label}</p>
<p className="text-xs text-slate-400 mt-0.5">{note}</p>
</div>

                ))}
</div>
</div>
</div>

        )}
</div>
</div>

  );

}

 