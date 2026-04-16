import { useDashboard } from '@/hooks/useDashboard';
import { useInvoices } from '@/hooks/useInvoices';
import { KPICard } from '@/components/dashboard/KPICard';
import { AgingBarChart } from '@/components/dashboard/AgingBarChart';
import { StatusPieChart } from '@/components/dashboard/StatusPieChart';
import { OverdueTable } from '@/components/dashboard/OverdueTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

export function DashboardPage() {
  const { summary, aging, loading } = useDashboard();
  const { invoices, loading: invLoading } = useInvoices({ limit: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Accounts payable overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Outstanding"
          value={loading ? '...' : formatCurrency(summary?.total_outstanding)}
          subtitle={`${summary?.open_count ?? 0} open invoices`}
          icon={DollarSign}
          variant="neutral"
          loading={loading}
        />
        <KPICard
          label="Total Overdue"
          value={loading ? '...' : formatCurrency(summary?.total_overdue)}
          subtitle={`${summary?.overdue_count ?? 0} overdue invoices`}
          icon={AlertTriangle}
          variant={summary?.overdue_count > 0 ? 'danger' : 'neutral'}
          loading={loading}
        />
        <KPICard
          label="Paid This Month"
          value={loading ? '...' : formatCurrency(summary?.paid_this_month)}
          icon={CheckCircle}
          variant="success"
          loading={loading}
        />
        <KPICard
          label="Total Invoices"
          value={loading ? '...' : String(summary?.total_invoices ?? 0)}
          subtitle="all time"
          icon={FileText}
          variant="neutral"
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Aging Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <AgingBarChart data={aging} loading={loading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Invoice Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={summary?.by_status} loading={loading} />
          </CardContent>
        </Card>
      </div>

      {/* Overdue invoices */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Top Overdue Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OverdueTable invoices={invoices} loading={invLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
