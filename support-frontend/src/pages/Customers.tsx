import { useEffect, useState } from 'react';

import { Search, Eye, Users, MapPin, CreditCard, ShieldCheck, ShieldAlert } from 'lucide-react';

import { supabase } from '../lib/supabase';

import type { Customer, Account, Transaction } from '../lib/supabase';

import RiskBadge, { StatusBadge } from '../components/RiskBadge';

import Header from '../components/Header';
 
function CustomerModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {

  const [accounts, setAccounts] = useState<Account[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [loadingDetails, setLoadingDetails] = useState(true);
 
  useEffect(() => {

    const load = async () => {

      const [{ data: accs }, { data: txns }] = await Promise.all([

        supabase.from('accounts').select('*').eq('customer_id', customer.id),

        supabase.from('transactions').select('*').eq('customer_id', customer.id).order('created_at', { ascending: false }).limit(5),

      ]);

      setAccounts(accs ?? []);

      setTransactions(txns ?? []);

      setLoadingDetails(false);

    };

    load();

  }, [customer.id]);
 
  const fmtCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
 
  const riskColor = {

    low: 'bg-emerald-500',

    medium: 'bg-amber-500',

    high: 'bg-orange-500',

    critical: 'bg-red-500',

  }[customer.risk_level];
 
  const creditColor = customer.credit_score >= 750 ? 'text-emerald-600' : customer.credit_score >= 650 ? 'text-amber-600' : 'text-red-600';
 
  return (
<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
<div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
<div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white rounded-t-2xl">
<div className="flex items-center gap-4">
<div className={`w-12 h-12 ${riskColor} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>

              {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
</div>
<div>
<h3 className="font-semibold text-slate-900 text-lg">{customer.name}</h3>
<p className="text-sm text-slate-400">{customer.email}</p>
</div>
</div>
<button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
</div>
 
        <div className="px-6 py-5 space-y-5">
<div className="flex flex-wrap gap-2">
<RiskBadge level={customer.risk_level} />
<StatusBadge status={customer.kyc_status} />

            {customer.is_pep && <span className="px-2.5 py-1 bg-purple-50 text-purple-700 ring-1 ring-purple-200 rounded-full text-xs font-medium">PEP</span>}

            {customer.is_sanctioned && <span className="px-2.5 py-1 bg-red-100 text-red-700 ring-1 ring-red-300 rounded-full text-xs font-medium">SANCTIONED</span>}
</div>
 
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
<div className="bg-slate-50 rounded-xl p-3">
<p className="text-xs text-slate-400">Total Assets</p>
<p className="text-base font-bold text-slate-900 mt-0.5">{fmtCurrency(customer.total_assets)}</p>
</div>
<div className="bg-slate-50 rounded-xl p-3">
<p className="text-xs text-slate-400">Credit Score</p>
<p className={`text-base font-bold mt-0.5 ${creditColor}`}>{customer.credit_score}</p>
</div>
<div className="bg-slate-50 rounded-xl p-3">
<p className="text-xs text-slate-400">Account Type</p>
<p className="text-base font-bold text-slate-900 mt-0.5 capitalize">{customer.account_type}</p>
</div>
<div className="bg-slate-50 rounded-xl p-3">
<p className="text-xs text-slate-400">Country</p>
<p className="text-base font-bold text-slate-900 mt-0.5">{customer.country}</p>
</div>
</div>
 
          <div>
<p className="text-sm font-semibold text-slate-900 mb-2">Accounts ({accounts.length})</p>

            {loadingDetails ? (
<div className="text-sm text-slate-400">Loading...</div>

            ) : (
<div className="space-y-2">

                {accounts.map(acc => (
<div key={acc.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
<div>
<p className="text-sm font-medium text-slate-800">{acc.account_number}</p>
<p className="text-xs text-slate-400 capitalize">{acc.account_type} · {acc.currency}</p>
</div>
<div className="flex items-center gap-3">
<p className="text-sm font-semibold text-slate-900">{fmtCurrency(acc.balance)}</p>
<StatusBadge status={acc.status} />
</div>
</div>

                ))}
</div>

            )}
</div>
 
          <div>
<p className="text-sm font-semibold text-slate-900 mb-2">Recent Transactions</p>

            {loadingDetails ? (
<div className="text-sm text-slate-400">Loading...</div>

            ) : transactions.length === 0 ? (
<div className="text-sm text-slate-400">No transactions found.</div>

            ) : (
<div className="space-y-2">

                {transactions.map(txn => (
<div key={txn.id} className={`flex items-center justify-between rounded-xl px-4 py-3 ${txn.flagged ? 'bg-red-50' : 'bg-slate-50'}`}>
<div>
<p className={`text-sm font-medium capitalize ${txn.flagged ? 'text-red-700' : 'text-slate-800'}`}>{txn.type}</p>
<p className="text-xs text-slate-400">{txn.description || 'No description'}</p>
</div>
<div className="flex items-center gap-3">
<p className={`text-sm font-semibold ${txn.flagged ? 'text-red-700' : 'text-slate-900'}`}>

                        {fmtCurrency(txn.amount)}
</p>
<StatusBadge status={txn.status} />
</div>
</div>

                ))}
</div>

            )}
</div>
 
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">

            Customer since {fmtDate(customer.created_at)} · Phone: {customer.phone}
</div>
</div>
</div>
</div>

  );

}
 
interface Props { onMenuClick: () => void; }
 
export default function Customers({ onMenuClick }: Props) {

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [riskFilter, setRiskFilter] = useState<string>('all');

  const [kycFilter, setKycFilter] = useState<string>('all');

  const [selected, setSelected] = useState<Customer | null>(null);
 
  const load = async () => {

    setLoading(true);

    const { data } = await supabase.from('customers').select('*').order('risk_level').order('created_at', { ascending: false });

    setCustomers((data ?? []) as Customer[]);

    setLoading(false);

  };
 
  useEffect(() => { load(); }, []);
 
  const filtered = customers.filter(c => {

    const matchSearch = search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());

    const matchRisk = riskFilter === 'all' || c.risk_level === riskFilter;

    const matchKyc = kycFilter === 'all' || c.kyc_status === kycFilter;

    return matchSearch && matchRisk && matchKyc;

  });
 
  const fmtCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);
 
  const creditColor = (score: number) => score >= 750 ? 'text-emerald-600' : score >= 650 ? 'text-amber-600' : 'text-red-600';
 
  return (
<div className="flex flex-col h-full">
<Header

        title="Customers"

        subtitle={`${filtered.length} of ${customers.length} customers`}

        onMenuClick={onMenuClick}

        onRefresh={load}

        loading={loading}

      />
<div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">

        {/* Stats row */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          {[

            { label: 'Total', count: customers.length, icon: Users, color: 'bg-blue-50 text-blue-600' },

            { label: 'High Risk', count: customers.filter(c => c.risk_level === 'high' || c.risk_level === 'critical').length, icon: ShieldAlert, color: 'bg-red-50 text-red-600' },

            { label: 'KYC Issues', count: customers.filter(c => c.kyc_status !== 'verified').length, icon: CreditCard, color: 'bg-amber-50 text-amber-600' },

            { label: 'PEP', count: customers.filter(c => c.is_pep).length, icon: ShieldCheck, color: 'bg-slate-100 text-slate-600' },

          ].map(({ label, count, icon: Icon, color }) => (
<div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
<div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
<Icon size={16} />
</div>
<div>
<p className="text-xl font-bold text-slate-900">{count}</p>
<p className="text-xs text-slate-400">{label}</p>
</div>
</div>

          ))}
</div>
 
        {/* Filters */}
<div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
<div className="flex-1 min-w-48 relative">
<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
<input

              type="text"

              placeholder="Search customers..."

              value={search}

              onChange={e => setSearch(e.target.value)}

              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

            />
</div>
<select

            value={riskFilter}

            onChange={e => setRiskFilter(e.target.value)}

            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
<option value="all">All Risk Levels</option>
<option value="critical">Critical</option>
<option value="high">High</option>
<option value="medium">Medium</option>
<option value="low">Low</option>
</select>
<select

            value={kycFilter}

            onChange={e => setKycFilter(e.target.value)}

            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
<option value="all">All KYC Status</option>
<option value="verified">Verified</option>
<option value="pending">Pending</option>
<option value="failed">Failed</option>
<option value="expired">Expired</option>
</select>
</div>
 
        {/* Table */}
<div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

          {loading ? (
<div className="p-8 text-center text-slate-400 text-sm">Loading customers...</div>

          ) : filtered.length === 0 ? (
<div className="p-8 text-center text-slate-400 text-sm">No customers found.</div>

          ) : (
<div className="overflow-x-auto">
<table className="w-full text-sm">
<thead>
<tr className="bg-slate-50 border-b border-slate-100">
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Country</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Risk</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">KYC</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Credit Score</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Total Assets</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-50">

                  {filtered.map(c => (
<tr key={c.id} className="hover:bg-slate-50 transition-colors">
<td className="px-5 py-3.5">
<div className="flex items-center gap-3">
<div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${

                            c.risk_level === 'critical' ? 'bg-red-500' :

                            c.risk_level === 'high' ? 'bg-orange-500' :

                            c.risk_level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'

                          }`}>

                            {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
</div>
<div>
<p className="font-medium text-slate-800">{c.name}</p>
<p className="text-xs text-slate-400">{c.email}</p>
</div>
</div>
</td>
<td className="px-5 py-3.5 hidden sm:table-cell">
<div className="flex items-center gap-1 text-slate-500">
<MapPin size={12} />
<span>{c.country}</span>
</div>
</td>
<td className="px-5 py-3.5">
<div className="flex items-center gap-1.5">
<RiskBadge level={c.risk_level} size="sm" />

                          {c.is_pep && <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">PEP</span>}
</div>
</td>
<td className="px-5 py-3.5 hidden md:table-cell"><StatusBadge status={c.kyc_status} /></td>
<td className="px-5 py-3.5 hidden lg:table-cell">
<span className={`font-semibold ${creditColor(c.credit_score)}`}>{c.credit_score}</span>
</td>
<td className="px-5 py-3.5 text-slate-700 font-medium hidden lg:table-cell">{fmtCurrency(c.total_assets)}</td>
<td className="px-5 py-3.5">
<button

                          onClick={() => setSelected(c)}

                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
>
<Eye size={14} />
</button>
</td>
</tr>

                  ))}
</tbody>
</table>
</div>

          )}
</div>
</div>

      {selected && <CustomerModal customer={selected} onClose={() => setSelected(null)} />}
</div>

  );

}

 