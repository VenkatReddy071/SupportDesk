import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import RiskAlerts from './pages/RiskAlerts';
import Customers from './pages/Customers';
import Transactions from './pages/Transactions';
import RiskRules from './pages/RiskRules';
import Reports from './pages/Reports';

type Page = 'dashboard' | 'alerts' | 'customers' | 'transactions' | 'rules' | 'reports';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuClick = () => setMobileOpen(true);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {page === 'dashboard' && <Dashboard onMenuClick={handleMenuClick} />}
        {page === 'alerts' && <RiskAlerts onMenuClick={handleMenuClick} />}
        {page === 'customers' && <Customers onMenuClick={handleMenuClick} />}
        {page === 'transactions' && <Transactions onMenuClick={handleMenuClick} />}
        {page === 'rules' && <RiskRules onMenuClick={handleMenuClick} />}
        {page === 'reports' && <Reports onMenuClick={handleMenuClick} />}
      </main>
    </div>
  );
}