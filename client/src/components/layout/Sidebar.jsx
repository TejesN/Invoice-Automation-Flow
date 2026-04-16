import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Building2, Users, CreditCard, BarChart2, Clock, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole, ROLES } from '@/context/RoleContext';
import { api } from '@/api/client';

const roleColorMap = {
  admin:    { dot: 'bg-blue-400',    badge: 'bg-blue-900/50 text-blue-300' },
  approver: { dot: 'bg-violet-400',  badge: 'bg-violet-900/50 text-violet-300' },
  clerk:    { dot: 'bg-emerald-400', badge: 'bg-emerald-900/50 text-emerald-300' },
};

export function Sidebar({ onClose }) {
  const { role, logout, can } = useRole();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  const roleInfo = ROLES.find(r => r.value === role);
  const colors = roleColorMap[role] || roleColorMap.admin;

  useEffect(() => {
    if (!can.approvePayment) { setPendingCount(0); return; }
    api.get('/payment-requests?status=pending')
      .then(data => setPendingCount(data.length))
      .catch(() => {});
  }, [role, can.approvePayment]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, show: true },
    { to: '/vendors', label: 'Vendors', icon: Users, show: true },
    { to: '/invoices', label: 'Invoices', icon: FileText, show: true },
    { to: '/payments', label: 'Payments', icon: CreditCard, show: true },
    { to: '/payment-requests', label: 'Requests', icon: Clock, show: true, badge: can.approvePayment && pendingCount > 0 ? pendingCount : 0 },
    { to: '/reports', label: 'Reports', icon: BarChart2, show: can.viewReports },
  ].filter(i => i.show);

  return (
    <aside className="flex h-full flex-col bg-slate-900 text-slate-100 w-64">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-700">
        <Building2 className="h-6 w-6 text-blue-400" />
        <div>
          <p className="font-semibold text-sm leading-tight">AP Automation</p>
          <p className="text-xs text-slate-400">Payables Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {badge > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile + logout */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-800 mb-2">
          {/* Avatar */}
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${colors.dot}`}>
            {roleInfo?.label[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-100 leading-tight">{roleInfo?.label}</p>
            <p className="text-xs text-slate-400 truncate">{roleInfo?.description}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Switch role
        </button>
      </div>
    </aside>
  );
}
