import { Menu, Bell, RefreshCw } from 'lucide-react';
 
interface HeaderProps {

  title: string;

  subtitle?: string;

  onMenuClick: () => void;

  onRefresh?: () => void;

  loading?: boolean;

  actions?: React.ReactNode;

}
 
export default function Header({ title, subtitle, onMenuClick, onRefresh, loading, actions }: HeaderProps) {

  return (
<header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
<div className="flex items-center gap-4">
<button

          onClick={onMenuClick}

          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
>
<Menu size={20} />
</button>
<div>
<h1 className="text-lg font-semibold text-slate-900">{title}</h1>

          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
</div>
</div>
<div className="flex items-center gap-2">

        {actions}

        {onRefresh && (
<button

            onClick={onRefresh}

            disabled={loading}

            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
>
<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
</button>

        )}
<button className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
<Bell size={18} />
<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
</button>
<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold ml-1">

          AO
</div>
</div>
</header>

  );

}

 