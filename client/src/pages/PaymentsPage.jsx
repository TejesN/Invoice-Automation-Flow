import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PAYMENT_METHODS } from '@/lib/constants';
import { Plus, Search, CreditCard } from 'lucide-react';

function methodLabel(value) {
  return PAYMENT_METHODS.find(m => m.value === value)?.label || value || '—';
}

export function PaymentsPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await api.get(`/payments${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      setPayments(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [search]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground text-sm">Record and track outgoing settlements.</p>
        </div>
        <Button onClick={() => navigate('/invoices')}>
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference or vendor..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <CreditCard className="h-10 w-10 mb-3 opacity-30" />
              <p className="font-medium">No payments recorded</p>
              <p className="text-sm">Open an invoice to record your first payment.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Reference</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Vendor</th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">Amount</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Linked Invoice</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Payment Date</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Method</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map(p => (
                  <tr
                    key={p.id}
                    className="hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/invoices/${p.invoiceId}`)}
                  >
                    <td className="px-6 py-4 font-mono text-xs font-medium">
                      {p.reference || <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-6 py-4 font-medium">{p.invoice?.vendor?.name || '—'}</td>
                    <td className="px-6 py-4 text-right font-semibold tabular-nums text-green-600">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {p.invoice?.invoiceNumber || '—'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(p.paymentDate)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{methodLabel(p.method)}</td>
                    <td className="px-6 py-4">
                      <Badge variant="success">Recorded</Badge>
                    </td>
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
