import { LayoutDashboard, AlertTriangle, Users, ArrowLeftRight, Shield, FileBarChart2, ChevronRight, X } from 'lucide-react';
 
type Page = 'dashboard' | 'alerts' | 'customers' | 'transactions' | 'rules' | 'reports';
 
interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}
 
const navItems: { id: Page; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'alerts', label: 'Risk Alerts', icon: AlertTriangle },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'rules', label: 'Risk Rules', icon: Shield },
  { id: 'reports', label: 'Reports', icon: FileBarChart2 },
];
 
export default function Sidebar({ currentPage, onNavigate, mobileOpen, onMobileClose }: SidebarProps) {
  return (
<>
      {mobileOpen && (
<div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onMobileClose}
        />
      )}
<aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 z-30 flex flex-col transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
<div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/50">
<div className="flex items-center gap-3">
<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
<Shield size={16} className="text-white" />
</div>
<div>
<p className="text-white font-semibold text-sm leading-tight">RiskGuard</p>
<p className="text-slate-400 text-xs">Banking Monitor</p>
</div>
</div>
<button
            onClick={onMobileClose}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
>
<X size={18} />
</button>
</div>
 
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = currentPage === id;
            return (
<button
                key={id}
                onClick={() => { onNavigate(id); onMobileClose(); }}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                  ${active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }
                `}
>
<div className="flex items-center gap-3">
<Icon size={16} className={active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                  {label}
</div>
                {active && <ChevronRight size={14} className="opacity-60" />}
</button>
            );
          })}
</nav>
 
        <div className="px-4 py-4 border-t border-slate-700/50">
<div className="bg-slate-800 rounded-lg px-3 py-2.5">
<p className="text-xs text-slate-400">System Status</p>
<div className="flex items-center gap-2 mt-1">
<div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
<p className="text-xs text-emerald-400 font-medium">All systems operational</p>
</div>
</div>
</div>
</aside>
</>
  );
}