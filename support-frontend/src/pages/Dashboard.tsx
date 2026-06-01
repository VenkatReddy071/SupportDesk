import { useEffect, useState } from 'react';

import { AlertTriangle, Users, ArrowLeftRight, TrendingUp, TrendingDown, ShieldAlert, Clock, CheckCircle } from 'lucide-react';

import { supabase } from '../lib/supabase';

import type { RiskAlert, Transaction } from '../lib/supabase';

import RiskBadge, { StatusBadge } from '../components/RiskBadge';

import Header from '../components/Header';

interface Stats {

    totalCustomers: number;

    criticalAlerts: number;

    highAlerts: number;

    openAlerts: number;

    flaggedTransactions: number;

    totalTransactionsToday: number;

    blockedTransactions: number;

}

function StatCard({ title, value, sub, icon: Icon, trend, color }: {

    title: string;

    value: string | number;

    sub?: string;

    icon: React.ComponentType<{ size?: number; className?: string }>;

    trend?: 'up' | 'down' | 'neutral';

    color: string;

}) {

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500 font-medium">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={18} className="text-white" />
                </div>
            </div>

            {sub && (
                <div className="flex items-center gap-1">

                    {trend === 'up' && <TrendingUp size={13} className="text-red-500" />}

                    {trend === 'down' && <TrendingDown size={13} className="text-emerald-500" />}
                    <p className="text-xs text-slate-400">{sub}</p>
                </div>

            )}
        </div>

    );

}

interface DashboardProps {

    onMenuClick: () => void;

}

export default function Dashboard({ onMenuClick }: DashboardProps) {

    const [stats, setStats] = useState<Stats | null>(null);

    const [recentAlerts, setRecentAlerts] = useState<RiskAlert[]>([]);

    const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);

    const [loading, setLoading] = useState(true);

    const load = async () => {

        setLoading(true);

        const [

            { count: totalCustomers },

            { count: criticalAlerts },

            { count: highAlerts },

            { count: openAlerts },

            { count: flaggedTxns },

            { count: blockedTxns },

            { data: alerts },

            { data: txns },

        ] = await Promise.all([

            supabase.from('customers').select('*', { count: 'exact', head: true }),

            supabase.from('risk_alerts').select('*', { count: 'exact', head: true }).eq('severity', 'critical').neq('status', 'resolved'),

            supabase.from('risk_alerts').select('*', { count: 'exact', head: true }).eq('severity', 'high').neq('status', 'resolved'),

            supabase.from('risk_alerts').select('*', { count: 'exact', head: true }).eq('status', 'open'),

            supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('flagged', true),

            supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'blocked'),

            supabase.from('risk_alerts').select('*, customers(name)').order('created_at', { ascending: false }).limit(5),

            supabase.from('transactions').select('*, customers(name)').order('created_at', { ascending: false }).limit(6),

        ]);

        setStats({

            totalCustomers: totalCustomers ?? 0,

            criticalAlerts: criticalAlerts ?? 0,

            highAlerts: highAlerts ?? 0,

            openAlerts: openAlerts ?? 0,

            flaggedTransactions: flaggedTxns ?? 0,

            totalTransactionsToday: 0,

            blockedTransactions: blockedTxns ?? 0,

        });

        setRecentAlerts((alerts ?? []) as RiskAlert[]);

        setRecentTxns((txns ?? []) as Transaction[]);

        setLoading(false);

    };

    useEffect(() => { load(); }, []);

    const fmtCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(n);

    const fmtTime = (s: string) => {

        const d = new Date(s);

        const diff = (Date.now() - d.getTime()) / 1000;

        if (diff < 60) return 'just now';

        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;

        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

        return `${Math.floor(diff / 86400)}d ago`;

    };

    return (
        <div className="flex flex-col h-full">
            <Header

                title="Dashboard"

                subtitle="Banking Risk Monitor — Real-time overview"

                onMenuClick={onMenuClick}

                onRefresh={load}

                loading={loading}

            />
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">

                {loading && !stats ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 h-28 animate-pulse">
                                <div className="bg-slate-100 h-4 w-24 rounded mb-3" />
                                <div className="bg-slate-100 h-8 w-16 rounded" />
                            </div>

                        ))}
                    </div>

                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total Customers" value={stats?.totalCustomers ?? 0} icon={Users} color="bg-blue-600" sub="Active portfolios" />
                        <StatCard title="Critical Alerts" value={stats?.criticalAlerts ?? 0} icon={ShieldAlert} color="bg-red-500" trend="up" sub="Require immediate action" />
                        <StatCard title="Open Alerts" value={stats?.openAlerts ?? 0} icon={AlertTriangle} color="bg-amber-500" sub={`${stats?.highAlerts ?? 0} high severity`} />
                        <StatCard title="Blocked Transactions" value={stats?.blockedTransactions ?? 0} icon={ArrowLeftRight} color="bg-orange-500" trend="up" sub={`${stats?.flaggedTransactions ?? 0} total flagged`} />
                    </div>

                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Recent Alerts */}
                    <div className="bg-white rounded-xl border border-slate-200">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-slate-900">Recent Risk Alerts</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Latest flagged events</p>
                            </div>
                            <AlertTriangle size={16} className="text-amber-500" />
                        </div>
                        <div className="divide-y divide-slate-50">

                            {recentAlerts.map(alert => (
                                <div key={alert.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${alert.severity === 'critical' ? 'bg-red-500' :

                                            alert.severity === 'high' ? 'bg-orange-500' :

                                                alert.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'

                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{alert.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{(alert.customers as any)?.name ?? 'Unknown'}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                        <RiskBadge level={alert.severity} size="sm" />
                                        <span className="text-xs text-slate-400">{fmtTime(alert.created_at)}</span>
                                    </div>
                                </div>

                            ))}

                            {recentAlerts.length === 0 && (
                                <div className="px-5 py-8 text-center text-sm text-slate-400">No alerts found</div>

                            )}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white rounded-xl border border-slate-200">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-slate-900">Recent Transactions</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Latest activity across all accounts</p>
                            </div>
                            <ArrowLeftRight size={16} className="text-blue-500" />
                        </div>
                        <div className="divide-y divide-slate-50">

                            {recentTxns.map(txn => (
                                <div key={txn.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${txn.flagged ? 'bg-red-50' : 'bg-slate-100'

                                        }`}>
                                        <ArrowLeftRight size={14} className={txn.flagged ? 'text-red-500' : 'text-slate-500'} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 capitalize truncate">{txn.type} — {(txn.customers as any)?.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{txn.description || 'No description'}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        <p className={`text-sm font-semibold ${txn.flagged ? 'text-red-600' : 'text-slate-900'}`}>

                                            {txn.type === 'withdrawal' ? '-' : '+'}{fmtCurrency(txn.amount)}
                                        </p>
                                        <StatusBadge status={txn.status} />
                                    </div>
                                </div>

                            ))}

                            {recentTxns.length === 0 && (
                                <div className="px-5 py-8 text-center text-sm text-slate-400">No transactions found</div>

                            )}
                        </div>
                    </div>
                </div>

                {/* Risk Distribution */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h2 className="font-semibold text-slate-900 mb-4">Alert Status Overview</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                        {[

                            { label: 'Open', icon: Clock, color: 'text-blue-600 bg-blue-50', count: stats?.openAlerts ?? 0 },

                            { label: 'Investigating', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50', count: stats?.highAlerts ?? 0 },

                            { label: 'Critical', icon: ShieldAlert, color: 'text-red-600 bg-red-50', count: stats?.criticalAlerts ?? 0 },

                            { label: 'Flagged Txns', icon: CheckCircle, color: 'text-orange-600 bg-orange-50', count: stats?.flaggedTransactions ?? 0 },

                        ].map(({ label, icon: Icon, color, count }) => (
                            <div key={label} className={`rounded-xl p-4 ${color.split(' ')[1]} flex items-center gap-3`}>
                                <Icon size={20} className={color.split(' ')[0]} />
                                <div>
                                    <p className="text-xl font-bold text-slate-900">{count}</p>
                                    <p className="text-xs text-slate-500">{label}</p>
                                </div>
                            </div>

                        ))}
                    </div>
                </div>
            </div>
        </div>

    );

}

