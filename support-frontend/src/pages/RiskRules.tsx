import { useEffect, useState } from 'react';
import { Shield, ToggleLeft, ToggleRight, Activity, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { RiskRule } from '../lib/supabase';
import Header from '../components/Header';
 
const RULE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  transaction_amount: { label: 'Amount Limit', color: 'bg-blue-50 text-blue-700' },
  frequency: { label: 'Frequency', color: 'bg-amber-50 text-amber-700' },
  geography: { label: 'Geography', color: 'bg-slate-100 text-slate-600' },
  behavioral: { label: 'Behavioral', color: 'bg-violet-50 text-violet-700' },
  kyc: { label: 'KYC', color: 'bg-emerald-50 text-emerald-700' },
  aml: { label: 'AML', color: 'bg-red-50 text-red-700' },
};
 
interface Props { onMenuClick: () => void; }
 
export default function RiskRules({ onMenuClick }: Props) {
  const [rules, setRules] = useState<RiskRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
 
  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('risk_rules').select('*').order('triggered_count', { ascending: false });
    setRules((data ?? []) as RiskRule[]);
    setLoading(false);
  };
 
  useEffect(() => { load(); }, []);
 
  const toggleRule = async (rule: RiskRule) => {
    setToggling(rule.id);
    const newVal = !rule.enabled;
    await supabase.from('risk_rules').update({ enabled: newVal }).eq('id', rule.id);
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: newVal } : r));
    setToggling(null);
  };
 
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
 
  const enabledCount = rules.filter(r => r.enabled).length;
  const totalTriggered = rules.reduce((sum, r) => sum + r.triggered_count, 0);
 
  return (
<div className="flex flex-col h-full">
<Header
        title="Risk Rules"
        subtitle="Automated risk detection configuration"
        onMenuClick={onMenuClick}
        onRefresh={load}
        loading={loading}
        actions={
<button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
<Plus size={14} />
<span className="hidden sm:inline">Add Rule</span>
</button>
        }
      />
<div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {/* Stats */}
<div className="grid grid-cols-3 gap-3">
<div className="bg-white rounded-xl border border-slate-200 p-4">
<p className="text-xs text-slate-400">Total Rules</p>
<p className="text-xl font-bold text-slate-900 mt-1">{rules.length}</p>
</div>
<div className="bg-white rounded-xl border border-slate-200 p-4">
<p className="text-xs text-slate-400">Active</p>
<p className="text-xl font-bold text-emerald-600 mt-1">{enabledCount}</p>
</div>
<div className="bg-white rounded-xl border border-slate-200 p-4">
<p className="text-xs text-slate-400">Total Triggered</p>
<p className="text-xl font-bold text-amber-600 mt-1">{totalTriggered}</p>
</div>
</div>
 
        {/* Rules list */}
        {loading ? (
<div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">Loading rules...</div>
        ) : (
<div className="space-y-3">
            {rules.map(rule => {
              const typeInfo = RULE_TYPE_LABELS[rule.rule_type] ?? { label: rule.rule_type, color: 'bg-slate-100 text-slate-600' };
              return (
<div
                  key={rule.id}
                  className={`bg-white rounded-xl border transition-all ${rule.enabled ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}
>
<div className="px-5 py-4 flex items-start gap-4">
<div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${rule.enabled ? 'bg-blue-50' : 'bg-slate-100'}`}>
<Shield size={18} className={rule.enabled ? 'text-blue-600' : 'text-slate-400'} />
</div>
<div className="flex-1 min-w-0">
<div className="flex items-start justify-between gap-3">
<div className="min-w-0">
<div className="flex items-center gap-2 flex-wrap">
<p className="font-semibold text-slate-900">{rule.name}</p>
<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                            {!rule.enabled && (
<span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-medium">Disabled</span>
                            )}
</div>
<p className="text-sm text-slate-500 mt-1 leading-relaxed">{rule.description}</p>
</div>
<button
                          onClick={() => toggleRule(rule)}
                          disabled={toggling === rule.id}
                          className="flex-shrink-0 transition-colors disabled:opacity-50"
                          title={rule.enabled ? 'Disable rule' : 'Enable rule'}
>
                          {rule.enabled
                            ? <ToggleRight size={28} className="text-blue-600" />
                            : <ToggleLeft size={28} className="text-slate-300" />
                          }
</button>
</div>
<div className="flex items-center gap-4 mt-3 flex-wrap">
<div className="flex items-center gap-1.5 text-xs text-slate-400">
<Activity size={12} />
<span><strong className="text-slate-700">{rule.triggered_count}</strong> triggers</span>
</div>
                        {rule.threshold > 0 && (
<div className="text-xs text-slate-400">
                            Threshold: <strong className="text-slate-700">
                              {rule.rule_type === 'transaction_amount' || rule.rule_type === 'frequency'
                                ? rule.threshold >= 1000 ? `$${rule.threshold.toLocaleString()}` : rule.threshold
                                : rule.threshold
                              }
</strong>
</div>
                        )}
<div className="text-xs text-slate-400">Added {fmtDate(rule.created_at)}</div>
</div>
</div>
</div>
</div>
              );
            })}
</div>
        )}
</div>
</div>
  );
}