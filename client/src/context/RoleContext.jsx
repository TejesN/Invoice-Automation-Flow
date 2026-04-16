import { createContext, useContext, useState } from 'react';

export const ROLES = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full access to all features',
    permissions: ['View & manage invoices', 'Record payments', 'Approve payment requests', 'View reports', 'Manage vendors'],
    color: 'blue',
  },
  {
    value: 'approver',
    label: 'Approver',
    description: 'Review and approve payments',
    permissions: ['View & manage invoices', 'Record payments', 'Approve payment requests', 'View reports'],
    color: 'violet',
  },
  {
    value: 'clerk',
    label: 'Clerk',
    description: 'Data entry and payment requests',
    permissions: ['View invoices', 'Submit payment requests', 'Manage vendors'],
    color: 'emerald',
  },
];

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('ap_role') || null);

  function login(r) {
    localStorage.setItem('ap_role', r);
    setRole(r);
  }

  function logout() {
    localStorage.removeItem('ap_role');
    setRole(null);
  }

  const can = {
    createInvoice: true,
    recordPayment: role === 'admin' || role === 'approver',
    requestPayment: role === 'clerk',
    approvePayment: role === 'admin' || role === 'approver',
    viewReports: role === 'admin' || role === 'approver',
  };

  return (
    <RoleContext.Provider value={{ role, login, logout, can }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
