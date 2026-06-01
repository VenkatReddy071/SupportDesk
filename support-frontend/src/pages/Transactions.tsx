import { useEffect, useState, useRef, useCallback } from 'react';

import { Search, Filter, AlertTriangle, Eye, Upload, FileUp, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';

import { supabase } from '../lib/supabase';

import type { Transaction } from '../lib/supabase';

import { StatusBadge } from '../components/RiskBadge';

import Header from '../components/Header';
 
const TYPE_ICONS: Record<string, string> = {

  deposit: '↓',

  withdrawal: '↑',

  transfer: '⇄',

  payment: '◈',

  wire: '⚡',

  crypto: '₿',

};
 
function RiskScore({ score }: { score: number }) {

  const color = score >= 80 ? 'bg-red-500' : score >= 60 ? 'bg-orange-500' : score >= 40 ? 'bg-amber-400' : 'bg-emerald-500';

  return (
<div className="flex items-center gap-2">
<div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
<div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
</div>
<span className={`text-xs font-semibold ${score >= 80 ? 'text-red-600' : score >= 60 ? 'text-orange-600' : 'text-slate-600'}`}>{score}</span>
</div>

  );

}
 
const CSV_TEMPLATE = `customer_email,customer_name,type,amount,currency,description,counterparty,status,risk_score,flagged,flag_reason

james.wilson@email.com,James Wilson,deposit,15000,USD,Payroll deposit,Acme Corp,completed,5,false,

sarah.chen@email.com,Sarah Chen,transfer,50000,USD,Business payroll,Payroll Account,completed,12,false,

carlos.m@email.com,Carlos Mendoza,withdrawal,14800,USD,ATM withdrawal,ATM-Mexico,flagged,82,true,Multiple large ATM withdrawals`;
 
interface UploadResult {

  success: boolean;

  inserted: number;

  total_rows: number;

  errors: { row: number; message: string }[];

  new_customers: number;

}
 
function UploadModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {

  const [file, setFile] = useState<File | null>(null);

  const [dragActive, setDragActive] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [result, setResult] = useState<UploadResult | null>(null);

  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
 
  const handleDrag = useCallback((e: React.DragEvent) => {

    e.preventDefault();

    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);

    else if (e.type === 'dragleave') setDragActive(false);

  }, []);
 
  const handleDrop = useCallback((e: React.DragEvent) => {

    e.preventDefault();

    e.stopPropagation();

    setDragActive(false);

    const dropped = e.dataTransfer.files?.[0];

    if (dropped && (dropped.name.endsWith('.csv') || dropped.type === 'text/csv')) {

      setFile(dropped);

      setError(null);

    } else {

      setError('Please upload a CSV file');

    }

  }, []);
 
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {

    const selected = e.target.files?.[0];

    if (selected) {

      setFile(selected);

      setError(null);

    }

  };
 
  const upload = async () => {

    if (!file) return;

    setUploading(true);

    setError(null);
 
    try {

      const formData = new FormData();

      formData.append('file', file);
 
      const { data: { session } } = await supabase.auth.getSession();

      const token = session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
 
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-transactions`, {

        method: 'POST',

        headers: {

          Authorization: `Bearer ${token}`,

        },

        body: formData,

      });
 
      const data = await res.json();
 
      if (!res.ok) {

        setError(data.error || 'Upload failed');

      } else {

        setResult(data as UploadResult);

        if (data.inserted > 0) onComplete();

      }

    } catch (err: any) {

      setError(err.message || 'Network error');

    } finally {

      setUploading(false);

    }

  };
 
  const downloadTemplate = () => {

    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = 'transaction_upload_template.csv';

    a.click();

    URL.revokeObjectURL(url);

  };
 
  return (
<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
<div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
<div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
<Upload size={18} className="text-blue-600" />
</div>
<div>
<p className="font-semibold text-slate-900">Upload Transactions</p>
<p className="text-xs text-slate-400 mt-0.5">Import from CSV file</p>
</div>
</div>
<button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">&times;</button>
</div>
 
        <div className="px-6 py-5 space-y-4">

          {result ? (
<div className="space-y-4">
<div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
<CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
<div>
<p className="font-medium text-emerald-700">Upload Complete</p>
<p className="text-sm text-emerald-600 mt-0.5">{result.inserted} of {result.total_rows} transactions imported successfully</p>
</div>
</div>
 
              {result.new_customers > 0 && (
<div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
<p className="text-sm text-blue-700">{result.new_customers} new customer(s) auto-created</p>
</div>

              )}
 
              {result.errors.length > 0 && (
<div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
<p className="text-sm font-medium text-amber-700 mb-2">{result.errors.length} row(s) skipped:</p>
<div className="space-y-1 max-h-32 overflow-y-auto">

                    {result.errors.map((err, i) => (
<p key={i} className="text-xs text-amber-600">

                        Row {err.row}: {err.message}
</p>

                    ))}
</div>
</div>

              )}
 
              <button

                onClick={onClose}

                className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
>

                Done
</button>
</div>

          ) : (
<>

              {/* Drop zone */}
<div

                onDragEnter={handleDrag}

                onDragLeave={handleDrag}

                onDragOver={handleDrag}

                onDrop={handleDrop}

                onClick={() => inputRef.current?.click()}

                className={`

                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all

                  ${dragActive ? 'border-blue-500 bg-blue-50' : file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}

                `}
>
<input

                  ref={inputRef}

                  type="file"

                  accept=".csv,text/csv"

                  onChange={handleFileSelect}

                  className="hidden"

                />

                {file ? (
<div className="flex items-center justify-center gap-3">
<FileSpreadsheet size={24} className="text-emerald-600" />
<div className="text-left">
<p className="font-medium text-slate-900">{file.name}</p>
<p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
</div>
<button

                      onClick={(e) => { e.stopPropagation(); setFile(null); }}

                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
>
<X size={16} />
</button>
</div>

                ) : (
<div>
<FileUp size={28} className="mx-auto text-slate-300 mb-3" />
<p className="text-sm font-medium text-slate-700">

                      {dragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
</p>
<p className="text-xs text-slate-400 mt-1">or click to browse</p>
</div>

                )}
</div>
 
              {error && (
<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
<AlertCircle size={16} className="text-red-500 flex-shrink-0" />
<p className="text-sm text-red-600">{error}</p>
</div>

              )}
 
              {/* Format info */}
<div className="bg-slate-50 rounded-xl p-4">
<p className="text-xs font-semibold text-slate-700 mb-2">Required CSV columns:</p>
<div className="flex flex-wrap gap-1.5">

                  {['customer_email', 'type', 'amount'].map(col => (
<span key={col} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono text-slate-700">{col}</span>

                  ))}
</div>
<p className="text-xs font-semibold text-slate-700 mt-3 mb-2">Optional columns:</p>
<div className="flex flex-wrap gap-1.5">

                  {['customer_name', 'currency', 'description', 'counterparty', 'status', 'risk_score', 'flagged', 'flag_reason'].map(col => (
<span key={col} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono text-slate-500">{col}</span>

                  ))}
</div>
<p className="text-xs text-slate-400 mt-2">

                  Valid types: deposit, withdrawal, transfer, payment, wire, crypto
</p>
</div>
 
              <button

                onClick={downloadTemplate}

                className="w-full py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
>
<FileSpreadsheet size={14} />

                Download template CSV
</button>
 
              <button

                onClick={upload}

                disabled={!file || uploading}

                className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
>

                {uploading ? (
<>
<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                    Uploading...
</>

                ) : (
<>
<Upload size={14} />

                    Upload & Process
</>

                )}
</button>
</>

          )}
</div>
</div>
</div>

  );

}
 
interface Props { onMenuClick: () => void; }
 
export default function Transactions({ onMenuClick }: Props) {

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [typeFilter, setTypeFilter] = useState('all');

  const [statusFilter, setStatusFilter] = useState('all');

  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const [selected, setSelected] = useState<Transaction | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
 
  const load = async () => {

    setLoading(true);

    const { data } = await supabase

      .from('transactions')

      .select('*, customers(name)')

      .order('created_at', { ascending: false })

      .limit(100);

    setTransactions((data ?? []) as Transaction[]);

    setLoading(false);

  };
 
  useEffect(() => { load(); }, []);
 
  const filtered = transactions.filter(t => {

    const name = (t.customers as any)?.name ?? '';

    const matchSearch = search === '' ||

      name.toLowerCase().includes(search.toLowerCase()) ||

      t.description.toLowerCase().includes(search.toLowerCase()) ||

      t.counterparty.toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === 'all' || t.type === typeFilter;

    const matchStatus = statusFilter === 'all' || t.status === statusFilter;

    const matchFlagged = !flaggedOnly || t.flagged;

    return matchSearch && matchType && matchStatus && matchFlagged;

  });
 
  const fmtCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

  const fmtTime = (s: string) => {

    const d = new Date(s);

    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  };
 
  const totalFlagged = transactions.filter(t => t.flagged).length;

  const totalBlocked = transactions.filter(t => t.status === 'blocked').length;

  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
 
  return (
<div className="flex flex-col h-full">
<Header

        title="Transactions"

        subtitle={`${filtered.length} transactions`}

        onMenuClick={onMenuClick}

        onRefresh={load}

        loading={loading}

        actions={
<button

            onClick={() => setUploadOpen(true)}

            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
>
<Upload size={14} />
<span className="hidden sm:inline">Upload CSV</span>
</button>

        }

      />
<div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">

        {/* Summary */}
<div className="grid grid-cols-3 gap-3">
<div className="bg-white rounded-xl border border-slate-200 p-4">
<p className="text-xs text-slate-400">Total Volume</p>
<p className="text-lg font-bold text-slate-900 mt-1">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(totalVolume)}</p>
</div>
<div className="bg-white rounded-xl border border-slate-200 p-4">
<p className="text-xs text-slate-400">Flagged</p>
<p className="text-lg font-bold text-orange-600 mt-1">{totalFlagged}</p>
</div>
<div className="bg-white rounded-xl border border-slate-200 p-4">
<p className="text-xs text-slate-400">Blocked</p>
<p className="text-lg font-bold text-red-600 mt-1">{totalBlocked}</p>
</div>
</div>
 
        {/* Filters */}
<div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
<div className="flex-1 min-w-48 relative">
<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
<input

              type="text"

              placeholder="Search transactions..."

              value={search}

              onChange={e => setSearch(e.target.value)}

              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

            />
</div>
<div className="flex items-center gap-2 flex-wrap">
<Filter size={14} className="text-slate-400" />
<select

              value={typeFilter}

              onChange={e => setTypeFilter(e.target.value)}

              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
<option value="all">All Types</option>
<option value="deposit">Deposit</option>
<option value="withdrawal">Withdrawal</option>
<option value="transfer">Transfer</option>
<option value="payment">Payment</option>
<option value="wire">Wire</option>
<option value="crypto">Crypto</option>
</select>
<select

              value={statusFilter}

              onChange={e => setStatusFilter(e.target.value)}

              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
<option value="all">All Status</option>
<option value="completed">Completed</option>
<option value="flagged">Flagged</option>
<option value="blocked">Blocked</option>
<option value="pending">Pending</option>
<option value="failed">Failed</option>
</select>
<label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
<input

                type="checkbox"

                checked={flaggedOnly}

                onChange={e => setFlaggedOnly(e.target.checked)}

                className="w-4 h-4 rounded accent-blue-600"

              />

              Flagged only
</label>
</div>
</div>
 
        {/* Table */}
<div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

          {loading ? (
<div className="p-8 text-center text-slate-400 text-sm">Loading transactions...</div>

          ) : filtered.length === 0 ? (
<div className="p-8 text-center text-slate-400 text-sm">No transactions found.</div>

          ) : (
<div className="overflow-x-auto">
<table className="w-full text-sm">
<thead>
<tr className="bg-slate-50 border-b border-slate-100">
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Transaction</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Customer</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Risk Score</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Time</th>
<th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Detail</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-50">

                  {filtered.map(txn => (
<tr

                      key={txn.id}

                      className={`transition-colors ${txn.flagged ? 'bg-red-50/30 hover:bg-red-50' : 'hover:bg-slate-50'}`}
>
<td className="px-5 py-3.5">
<div className="flex items-center gap-3">
<div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${

                            txn.status === 'blocked' ? 'bg-red-100 text-red-600' :

                            txn.flagged ? 'bg-orange-100 text-orange-600' :

                            'bg-slate-100 text-slate-600'

                          }`}>

                            {TYPE_ICONS[txn.type] ?? '?'}
</div>
<div className="min-w-0">
<p className="font-medium text-slate-800 capitalize">{txn.type}</p>
<p className="text-xs text-slate-400 truncate max-w-36">{txn.description || 'No description'}</p>
</div>
</div>
</td>
<td className="px-5 py-3.5 text-slate-600 hidden sm:table-cell whitespace-nowrap">

                        {(txn.customers as any)?.name ?? '—'}
</td>
<td className="px-5 py-3.5">
<p className={`font-semibold whitespace-nowrap ${txn.flagged ? 'text-red-700' : 'text-slate-900'}`}>

                          {fmtCurrency(txn.amount)}
</p>
<p className="text-xs text-slate-400">{txn.currency}</p>
</td>
<td className="px-5 py-3.5 hidden md:table-cell">
<RiskScore score={txn.risk_score} />
</td>
<td className="px-5 py-3.5">
<div className="flex items-center gap-1.5">
<StatusBadge status={txn.status} />

                          {txn.flagged && <AlertTriangle size={12} className="text-orange-500" />}
</div>
</td>
<td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell whitespace-nowrap">{fmtTime(txn.created_at)}</td>
<td className="px-5 py-3.5">
<button

                          onClick={() => setSelected(txn)}

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
 
      {/* Transaction Detail Modal */}

      {selected && (
<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
<div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
<div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
<div>
<p className="font-semibold text-slate-900 capitalize">{selected.type} Transaction</p>
<p className="text-xs text-slate-400 mt-0.5 font-mono">{selected.id.slice(0, 20)}...</p>
</div>
<button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">&times;</button>
</div>
<div className="px-6 py-5 space-y-4">

              {selected.flagged && (
<div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
<AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
<div>
<p className="text-sm font-medium text-red-700">Transaction Flagged</p>
<p className="text-xs text-red-600 mt-0.5">{selected.flag_reason || 'No reason provided'}</p>
</div>
</div>

              )}
<div className="grid grid-cols-2 gap-3">

                {[

                  ['Amount', `${fmtCurrency(selected.amount)} ${selected.currency}`],

                  ['Status', selected.status],

                  ['Risk Score', selected.risk_score.toString()],

                  ['Customer', (selected.customers as any)?.name ?? 'Unknown'],

                  ['Counterparty', selected.counterparty || '—'],

                  ['Description', selected.description || '—'],

                  ['Date', fmtTime(selected.created_at)],

                ].map(([label, val]) => (
<div key={label} className="bg-slate-50 rounded-xl p-3">
<p className="text-xs text-slate-400">{label}</p>
<p className="text-sm font-medium text-slate-900 mt-0.5 capitalize">{val}</p>
</div>

                ))}
</div>
</div>
</div>
</div>

      )}
 
      {/* Upload Modal */}

      {uploadOpen && (
<UploadModal

          onClose={() => setUploadOpen(false)}

          onComplete={load}

        />

      )}
</div>

  );

}

 