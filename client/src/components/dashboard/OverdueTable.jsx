import { useNavigate } from 'react-router-dom';
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, daysOverdue } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

export function OverdueTable({ invoices = [], loading }) {
  const navigate = useNavigate();

  if (loading) return <Skeleton className="h-40 w-full" />;

  const overdue = invoices
    .filter(i => i.status === 'overdue')
    .sort((a, b) => daysOverdue(b.dueDate) - daysOverdue(a.dueDate))
    .slice(0, 5);

  if (!overdue.length) {
    return (
      <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mb-2 text-green-500 opacity-70" />
        <p className="text-sm font-medium text-green-600">No overdue invoices!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {overdue.map(inv => (
        <div
          key={inv.id}
          className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 p-3 cursor-pointer hover:bg-red-50 transition-colors"
          onClick={() => navigate(`/invoices/${inv.id}`)}
        >
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{inv.vendor_name}</p>
            <p className="text-xs text-muted-foreground font-mono">{inv.invoiceNumber}</p>
          </div>
          <div className="flex items-center gap-3 ml-3 shrink-0">
            <span className="text-xs text-red-600 font-medium">{daysOverdue(inv.dueDate)}d overdue</span>
            <span className="text-sm font-semibold tabular-nums">{formatCurrency(inv.amount - inv.amountPaid)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
