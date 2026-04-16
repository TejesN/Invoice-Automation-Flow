import { formatCurrency, formatDate } from '@/lib/utils';
import { PAYMENT_METHODS } from '@/lib/constants';
import { CreditCard } from 'lucide-react';

function methodLabel(value) {
  return PAYMENT_METHODS.find(m => m.value === value)?.label || value || '—';
}

export function PaymentList({ payments = [] }) {
  if (!payments.length) {
    return (
      <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
        <CreditCard className="h-8 w-8 mb-2 opacity-30" />
        <p className="text-sm">No payments recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map(p => (
        <div key={p.id} className="flex items-start justify-between rounded-lg border p-4 bg-muted/20">
          <div className="space-y-1">
            <p className="text-sm font-medium">{formatDate(p.paymentDate)}</p>
            <p className="text-xs text-muted-foreground">{methodLabel(p.method)}{p.reference ? ` · Ref: ${p.reference}` : ''}</p>
            {p.notes && <p className="text-xs text-muted-foreground italic">{p.notes}</p>}
          </div>
          <p className="text-sm font-semibold text-green-600 tabular-nums">{formatCurrency(p.amount)}</p>
        </div>
      ))}
    </div>
  );
}
