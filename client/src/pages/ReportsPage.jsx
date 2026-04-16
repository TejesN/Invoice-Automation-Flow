import { useReports } from '@/hooks/useReports';
import { MonthlySpendChart } from '@/components/reports/MonthlySpendChart';
import { PaymentTrendsChart } from '@/components/reports/PaymentTrendsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

export function ReportsPage() {
  const { monthlySpend, paymentTrends, loading } = useReports();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground text-sm">Spending insights and payment analytics.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/api/reports/export?format=csv" download>
              <FileText className="h-4 w-4 mr-2" />
              Export CSV
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/api/reports/export?format=excel" download>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Spend by Vendor</CardTitle>
            <p className="text-xs text-muted-foreground">Last 12 months — USD equivalent</p>
          </CardHeader>
          <CardContent>
            <MonthlySpendChart
              data={monthlySpend.data}
              vendors={monthlySpend.vendors}
              loading={loading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment Trends</CardTitle>
            <p className="text-xs text-muted-foreground">Total payments per month — USD equivalent</p>
          </CardHeader>
          <CardContent>
            <PaymentTrendsChart data={paymentTrends} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
