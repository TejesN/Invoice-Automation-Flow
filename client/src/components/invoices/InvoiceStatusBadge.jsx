import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS } from '@/lib/constants';

const variantMap = {
  pending: 'neutral',
  partial: 'warning',
  overdue: 'danger',
  paid: 'success',
};

export function InvoiceStatusBadge({ status }) {
  return (
    <Badge variant={variantMap[status] || 'neutral'}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}
