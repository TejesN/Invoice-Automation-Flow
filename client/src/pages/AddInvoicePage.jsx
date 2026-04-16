import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { useVendors } from '@/hooks/useVendors';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Upload, Sparkles } from 'lucide-react';

export function AddInvoicePage() {
  const navigate = useNavigate();
  const { vendors, reload: reloadVendors } = useVendors();
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [prefillValues, setPrefillValues] = useState(null);
  const fileInputRef = useRef(null);

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    setPrefillValues(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const extracted = await api.upload('/invoices/extract', formData);

      // Normalize field names from the API response
      const normalized = {
        invoice_number: extracted.invoiceNumber || extracted.invoice_number || '',
        amount:         extracted.amount || '',
        issueDate:      extracted.issueDate || '',
        dueDate:        extracted.dueDate || '',
        notes:          extracted.notes || '',
        vendorName:     extracted.vendorName || '',
        currency:       extracted.currency || 'USD',
        exchange_rate:  extracted.exchangeRate ?? 1.0,
      };

      // Try to match extracted vendor name against existing vendors
      const matched = vendors.find(v =>
        v.name.toLowerCase().includes(normalized.vendorName.toLowerCase()) ||
        normalized.vendorName.toLowerCase().includes(v.name.toLowerCase())
      );

      if (matched) {
        // Existing vendor matched
        setPrefillValues({ ...normalized, vendor_id: String(matched.id) });
        toast.success(`Invoice extracted — vendor matched to "${matched.name}"`);
      } else if (normalized.vendorName) {
        // New vendor — auto-create it
        try {
          const newVendor = await api.post('/vendors', { name: normalized.vendorName });
          await reloadVendors();
          setPrefillValues({ ...normalized, vendor_id: String(newVendor.id) });
          toast.success(`Invoice extracted — new vendor "${newVendor.name}" added automatically`);
        } catch {
          // Vendor creation failed — still prefill other fields
          setPrefillValues(normalized);
          toast.success('Invoice extracted — please select vendor manually');
        }
      } else {
        setPrefillValues(normalized);
        toast.success('Invoice extracted — please select vendor manually');
      }
    } catch (err) {
      toast.error(`Extraction failed: ${err.message}`);
    } finally {
      setExtracting(false);
      e.target.value = '';
    }
  }

  async function handleSubmit(data) {
    setLoading(true);
    try {
      const invoice = await api.post('/invoices', data);
      toast.success('Invoice created successfully');
      navigate(`/invoices/${invoice.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Button variant="ghost" className="-ml-2" onClick={() => navigate('/invoices')}>
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Invoices
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Invoice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* PDF Upload */}
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-5 text-center hover:border-muted-foreground/40 transition-colors">
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-medium mb-1">Auto-fill with AI</p>
            <p className="text-xs text-muted-foreground mb-3">Upload a PDF or image invoice — Claude will extract the fields for you</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={extracting}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {extracting ? 'Extracting...' : 'Upload Invoice'}
            </Button>
          </div>

          {extracting && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
          )}

          {!extracting && (
            vendors.length === 0 && !prefillValues ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                <p>No vendors found. Add vendors first or upload an invoice to auto-create one.</p>
              </div>
            ) : (
              <InvoiceForm
                vendors={vendors}
                onSubmit={handleSubmit}
                loading={loading}
                prefillValues={prefillValues}
              />
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
