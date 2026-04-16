import { useNavigate } from 'react-router-dom';
import { Building2, Check } from 'lucide-react';
import { ROLES, useRole } from '@/context/RoleContext';

const colorMap = {
  blue: {
    card: 'border-blue-200 hover:border-blue-400 hover:shadow-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    icon: 'bg-blue-600',
    check: 'text-blue-500',
    btn: 'bg-blue-600 hover:bg-blue-700',
  },
  violet: {
    card: 'border-violet-200 hover:border-violet-400 hover:shadow-violet-100',
    badge: 'bg-violet-100 text-violet-700',
    icon: 'bg-violet-600',
    check: 'text-violet-500',
    btn: 'bg-violet-600 hover:bg-violet-700',
  },
  emerald: {
    card: 'border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700',
    icon: 'bg-emerald-600',
    check: 'text-emerald-500',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
  },
};

export function LoginPage() {
  const { login } = useRole();
  const navigate = useNavigate();

  function handleLogin(roleValue) {
    login(roleValue);
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-slate-900 rounded-xl p-2.5">
          <Building2 className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">AP Automation</h1>
          <p className="text-xs text-slate-500">Payables Dashboard</p>
        </div>
      </div>

      <div className="mt-8 mb-3 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Welcome to the Demo</h2>
        <p className="text-slate-500 mt-1 text-sm">Choose a role to explore the app with different permissions</p>
      </div>

      {/* Role cards */}
      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {ROLES.map((r) => {
          const c = colorMap[r.color];
          return (
            <button
              key={r.value}
              onClick={() => handleLogin(r.value)}
              className={`text-left rounded-2xl border-2 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer ${c.card}`}
            >
              {/* Role icon + badge */}
              <div className="flex items-start justify-between mb-4">
                <div className={`rounded-xl p-2.5 ${c.icon}`}>
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
                  {r.label}
                </span>
              </div>

              {/* Name + description */}
              <h3 className="font-bold text-slate-900 text-base">{r.label}</h3>
              <p className="text-slate-500 text-xs mt-0.5 mb-4">{r.description}</p>

              {/* Permissions list */}
              <ul className="space-y-1.5">
                {r.permissions.map((perm) => (
                  <li key={perm} className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className={`h-3.5 w-3.5 shrink-0 ${c.check}`} />
                    {perm}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className={`mt-5 w-full text-center text-white text-sm font-semibold py-2 rounded-lg ${c.btn} transition-colors`}>
                Continue as {r.label}
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-xs text-slate-400">Demo only — no real authentication</p>
    </div>
  );
}
