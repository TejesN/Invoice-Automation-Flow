import { useSearchParams, useNavigate } from 'react-router-dom';
import { useInvoices } from '@/hooks/useInvoices';
import { useVendors } from '@/hooks/useVendors';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';
import { InvoiceFilters } from '@/components/invoices/InvoiceFilters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function InvoicesPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { vendors } = useVendors();

  const filters = {
    status: params.get('status') || undefined,
    vendor_id: params.get('vendor_id') || undefined,
    search: params.get('search') || undefined,
    page: parseInt(params.get('page')) || 1,
    limit: 20,
  };

  const { invoices, total, page, limit, loading } = useInvoices(filters);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-muted-foreground text-sm">{total} total invoices</p>
        </div>
        <Button onClick={() => navigate('/invoices/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Invoice
        </Button>
      </div>

      <InvoiceFilters vendors={vendors} />

      <InvoiceTable
        invoices={invoices}
        total={total}
        page={page}
        limit={limit}
        loading={loading}
      />
    </div>
  );
}
