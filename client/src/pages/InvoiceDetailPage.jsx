import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useInvoice } from '@/hooks/useInvoices';
import { api } from '@/api/client';
import { useRole } from '@/context/RoleContext';
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge';
import { PaymentList } from '@/components/payments/PaymentList';
import { RecordPaymentForm } from '@/components/payments/RecordPaymentForm';
import { RequestPaymentForm } from '@/components/payments/RequestPaymentForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';

export function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoice, loading, reload } = useInvoice(id);
  const { role, can } = useRole();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handlePayment(data) {
    try {
      await api.post('/payments', { ...data, invoice_id: id });
      toast.success('Payment recorded');
      setShowPaymentForm(false);
      reload();
    } catch (err) { toast.error(err.message); }
  }

  async function handleRequest(data) {
    try {
      await api.post('/payment-requests', data);
      toast.success('Payment request submitted for approval');
      setShowPaymentForm(false);
    } catch (err) { toast.error(err.message); }
  }

  async function handleDelete() {
    if (!confirm('Delete this invoice and all its payments?')) return;
    setDeleting(true);
    try {
      await api.delete(`/invoices/${id}`);
      toast.success('Invoice deleted');
      navigate('/invoices');
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 text-muted-foreground">
        <p>Invoice not found.</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/invoices')}>Back</Button>
      </div>
    );
  }

  const remaining = invoice.amount - invoice.amountPaid;
  const isNonUSD = invoice.currency && invoice.currency !== 'USD';

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="-ml-2" onClick={() => navigate('/invoices')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Invoices
        </Button>
        {can.recordPayment && (
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-1">{invoice.invoiceNumber}</p>
              <CardTitle>{invoice.vendor_name}</CardTitle>
              {invoice.vendor_email && <p className="text-sm text-muted-foreground mt-0.5">{invoice.vendor_email}</p>}
            </div>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Invoice Amount</p>
              <p className="font-semibold tabular-nums">{formatCurrency(invoice.amount)} {isNonUSD && <span className="text-muted-foreground text-xs">{invoice.currency}</span>}</p>
            </div>
            {isNonUSD && (
              <div>
                <p className="text-muted-foreground text-xs">USD Equivalent</p>
                <p className="font-semibold tabular-nums">{formatCurrency(invoice.amount * invoice.exchangeRate)}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-xs">Amount Paid</p>
              <p className="font-semibold tabular-nums text-green-600">{formatCurrency(invoice.amountPaid)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Balance Due</p>
              <p className="font-semibold tabular-nums text-lg">{formatCurrency(remaining)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Due Date</p>
              <p className="font-medium">{formatDate(invoice.dueDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Issue Date</p>
              <p className="font-medium">{formatDate(invoice.issueDate)}</p>
            </div>
            {isNonUSD && (
              <div>
                <p className="text-muted-foreground text-xs">Exchange Rate</p>
                <p className="font-medium">1 {invoice.currency} = {invoice.exchangeRate} USD</p>
              </div>
            )}
          </div>

          {invoice.notes && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{invoice.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Payment History</CardTitle>
            {remaining > 0.001 && !showPaymentForm && (can.recordPayment || can.requestPayment) && (
              <Button size="sm" variant={can.requestPayment ? 'outline' : 'default'} onClick={() => setShowPaymentForm(true)}>
                <Plus className="h-4 w-4 mr-1" />
                {can.requestPayment ? 'Request Payment' : 'Record Payment'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showPaymentForm && (
            <div className="mb-6 p-4 rounded-lg border bg-muted/20">
              <h3 className="text-sm font-semibold mb-4">
                {can.requestPayment ? 'Submit Payment Request' : 'Record Payment'}
              </h3>
              {can.requestPayment ? (
                <RequestPaymentForm
                  invoiceId={id}
                  remaining={remaining}
                  onSuccess={handleRequest}
                  onCancel={() => setShowPaymentForm(false)}
                />
              ) : (
                <RecordPaymentForm
                  invoiceId={id}
                  remaining={remaining}
                  onSuccess={handlePayment}
                  onCancel={() => setShowPaymentForm(false)}
                />
              )}
            </div>
          )}
          <PaymentList payments={invoice.payments} />
        </CardContent>
      </Card>
    </div>
  );
}
