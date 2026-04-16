import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRole } from '@/context/RoleContext';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { AddInvoicePage } from '@/pages/AddInvoicePage';
import { InvoiceDetailPage } from '@/pages/InvoiceDetailPage';
import { VendorsPage } from '@/pages/VendorsPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { PaymentRequestsPage } from '@/pages/PaymentRequestsPage';

function NotFound() {
  return <div className="text-center py-20 text-muted-foreground">404 — Page not found</div>;
}

function AuthGate({ children }) {
  const { role } = useRole();
  if (!role) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AuthGate><AppShell /></AuthGate>}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/new" element={<AddInvoicePage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/payment-requests" element={<PaymentRequestsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
