import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { usePaymentRequests } from '@/hooks/usePaymentRequests';
import { useRole } from '@/context/RoleContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PAYMENT_METHODS } from '@/lib/constants';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

function methodLabel(v) {
  return PAYMENT_METHODS.find(m => m.value === v)?.label || v || '—';
}

const statusBadge = {
  pending:  <Badge variant="warning">Pending</Badge>,
  approved: <Badge variant="success">Approved</Badge>,
  rejected: <Badge variant="danger">Rejected</Badge>,
};

export function PaymentRequestsPage() {
  const navigate = useNavigate();
  const { role, can } = useRole();
  const { requests, loading, approve, reject } = usePaymentRequests();

  async function handleApprove(id) {
    try {
      await approve(id);
      toast.success('Payment approved and recorded');
    } catch (err) { toast.error(err.message); }
  }

  async function handleReject(id) {
    try {
      await reject(id);
      toast.success('Payment request rejected');
    } catch (err) { toast.error(err.message); }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Payment Requests</h1>
        <p className="text-muted-foreground text-sm">
          {can.approvePayment ? 'Review and approve pending payment requests.' : 'Your submitted payment requests.'}
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <Clock className="h-10 w-10 mb-3 opacity-30" />
              <p className="font-medium">No payment requests</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Invoice</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Vendor</th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">Amount</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Method</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Requested By</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                  {can.approvePayment && <th className="px-6 py-3 text-left font-medium text-muted-foreground">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs cursor-pointer text-blue-600 hover:underline" onClick={() => navigate(`/invoices/${r.invoiceId}`)}>
                      {r.invoice?.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 font-medium">{r.invoice?.vendor?.name || '—'}</td>
                    <td className="px-6 py-4 text-right font-semibold tabular-nums text-green-600">{formatCurrency(r.amount)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(r.paymentDate)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{methodLabel(r.method)}</td>
                    <td className="px-6 py-4">
                      <Badge variant="neutral" className="capitalize">{r.requestedBy}</Badge>
                    </td>
                    <td className="px-6 py-4">{statusBadge[r.status]}</td>
                    {can.approvePayment && (
                      <td className="px-6 py-4">
                        {r.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleApprove(r.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleReject(r.id)}>
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
